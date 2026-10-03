"""FastAPI app — LelangHub backend."""
from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
import requests as http_requests
from typing import Optional
from datetime import datetime
from database import init_db, get_db, upsert_lot, get_lots
from scrapers import djkn, koelak, ibid
from pricing import price_lot
from tiers import calc_tier, tier_badge

app = FastAPI(title="LelangHub API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/api/scrape")
def scrape_all():
    """Trigger scrape from all sources."""
    conn = get_db()
    total = 0

    for scraper in [djkn, koelak, ibid]:
        try:
            lots = scraper.scrape()
            for lot in lots:
                upsert_lot(conn, lot)
            total += len(lots)
            print(f"[{scraper.__name__}] {len(lots)} lots")
        except Exception as e:
            print(f"[{scraper.__name__}] error: {e}")

    conn.commit()
    conn.close()
    return {"status": "ok", "total_lots": total}

@app.get("/api/price")
def price_unpriced():
    """Price lots that don't have market price yet."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, nama, harga_lelang FROM lots WHERE harga_pasaran IS NULL LIMIT 20"
    ).fetchall()

    priced = 0
    for row in rows:
        result = price_lot(row["nama"], row["harga_lelang"])
        if result["harga_pasaran"]:
            tier, diskon = calc_tier(row["harga_lelang"], result["harga_pasaran"])
            conn.execute("""
                UPDATE lots SET harga_pasaran=?, diskon_persen=?, tier=?, priced_at=?
                WHERE id=?
            """, (result["harga_pasaran"], result["diskon_persen"], tier,
                  datetime.now().isoformat(), row["id"]))
            priced += 1

    conn.commit()
    conn.close()
    return {"status": "ok", "priced": priced}

@app.get("/api/lots")
def list_lots(
    limit: int = Query(50, le=200),
    page: int = Query(1, ge=1),
    search: Optional[str] = None,
    kategori: Optional[str] = None,
    tier: Optional[str] = None,
    max_harga: Optional[int] = None,
):
    """List lots with filters."""
    conn = get_db()
    offset = (page - 1) * limit
    lots, total = get_lots(conn, limit, offset, search, kategori, tier, max_harga)
    conn.close()

    # Add tier badge
    for lot in lots:
        lot["tier_badge"] = tier_badge(lot.get("tier", "?"))

    return {
        "data": lots,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }

@app.get("/api/lots/{lot_id}")
def get_lot(lot_id: str):
    """Get single lot detail."""
    conn = get_db()
    row = conn.execute("SELECT * FROM lots WHERE id=?", (lot_id,)).fetchone()
    conn.close()
    if not row:
        return {"error": "not found"}, 404
    lot = dict(row)
    lot["tier_badge"] = tier_badge(lot.get("tier", "?"))
    return lot

@app.get("/api/kategori")
def list_kategori():
    """List all categories with count."""
    conn = get_db()
    rows = conn.execute(
        "SELECT kategori, COUNT(*) as count FROM lots GROUP BY kategori ORDER BY count DESC"
    ).fetchall()
    conn.close()
    return [{"kategori": r["kategori"], "count": r["count"]} for r in rows]

@app.get("/api/stats")
def stats():
    """Overall stats."""
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM lots").fetchone()[0]
    by_tier = conn.execute(
        "SELECT tier, COUNT(*) as count FROM lots WHERE tier IS NOT NULL GROUP BY tier"
    ).fetchall()
    by_sumber = conn.execute(
        "SELECT sumber, COUNT(*) as count FROM lots GROUP BY sumber"
    ).fetchall()
    conn.close()

    return {
        "total_lots": total,
        "by_tier": {r["tier"]: r["count"] for r in by_tier},
        "by_sumber": {r["sumber"]: r["count"] for r in by_sumber},
    }

@app.get("/api/tiers")
def list_tiers():
    """List tier definitions."""
    return [
        {"tier": "S", "min_diskon": 70, "badge": "🥇", "desc": "Super murah"},
        {"tier": "A", "min_diskon": 50, "badge": "🥈", "desc": "Sangat worth it"},
        {"tier": "B", "min_diskon": 30, "badge": "🥉", "desc": "Lumayan"},
        {"tier": "C", "min_diskon": 10, "badge": "📦", "desc": "Tipis"},
        {"tier": "D", "min_diskon": 0, "badge": "⚠️", "desc": "Hampir sama"},
    ]

@app.get("/api/proxy-image")
def proxy_image(url: str = Query(...)):
    """Proxy external images to bypass hotlink protection."""
    try:
        r = http_requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "Referer": "https://lelang.go.id/",
        }, timeout=10)
        if r.status_code == 200 and "image" in r.headers.get("content-type", ""):
            return Response(content=r.content, media_type=r.headers["content-type"])
        return Response(status_code=404)
    except Exception:
        return Response(status_code=502)
