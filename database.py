"""SQLite database for lelang lots."""
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "lelang.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS lots (
            id TEXT PRIMARY KEY,
            nama TEXT NOT NULL,
            kategori TEXT,
            harga_lelang INTEGER,
            harga_pasaran INTEGER,
            diskon_persen REAL,
            tier TEXT,
            lokasi TEXT,
            kpknl TEXT,
            deadline TEXT,
            link TEXT,
            foto TEXT,
            sumber TEXT,
            uang_jaminan INTEGER,
            deskripsi TEXT,
            scraped_at TEXT,
            priced_at TEXT
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_tier ON lots(tier)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_kategori ON lots(kategori)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sumber ON lots(sumber)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_harga ON lots(harga_lelang)")
    conn.commit()
    conn.close()

import json

def upsert_lot(conn, lot: dict):
    foto = json.dumps(lot.get("foto", []))
    conn.execute("""
        INSERT INTO lots (id, nama, kategori, harga_lelang, harga_pasaran,
            diskon_persen, tier, lokasi, kpknl, deadline, link, foto, sumber,
            uang_jaminan, deskripsi, scraped_at, priced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            nama=excluded.nama,
            harga_lelang=excluded.harga_lelang,
            deadline=excluded.deadline,
            foto=excluded.foto,
            scraped_at=excluded.scraped_at
    """, (
        lot["id"], lot["nama"], lot.get("kategori"),
        lot.get("harga_lelang"), lot.get("harga_pasaran"),
        lot.get("diskon_persen"), lot.get("tier"),
        lot.get("lokasi"), lot.get("kpknl"),
        lot.get("deadline"), lot.get("link"),
        foto, lot.get("sumber"),
        lot.get("uang_jaminan"), lot.get("deskripsi"),
        datetime.now().isoformat(), lot.get("priced_at")
    ))

def get_lots(conn, limit=50, offset=0, search=None, kategori=None, tier=None, max_harga=None):
    q = "SELECT * FROM lots WHERE 1=1"
    params = []
    if search:
        q += " AND nama LIKE ?"
        params.append(f"%{search}%")
    if kategori:
        q += " AND kategori = ?"
        params.append(kategori)
    if tier:
        q += " AND tier = ?"
        params.append(tier)
    if max_harga:
        q += " AND harga_lelang <= ?"
        params.append(max_harga)
    q += " ORDER BY harga_lelang ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = conn.execute(q, params).fetchall()
    total_q = "SELECT COUNT(*) FROM lots WHERE 1=1"
    total_params = []
    if search:
        total_q += " AND nama LIKE ?"
        total_params.append(f"%{search}%")
    if kategori:
        total_q += " AND kategori = ?"
        total_params.append(kategori)
    if tier:
        total_q += " AND tier = ?"
        total_params.append(tier)
    if max_harga:
        total_q += " AND harga_lelang <= ?"
        total_params.append(max_harga)
    total = conn.execute(total_q, total_params).fetchone()[0]

    return [dict(r) for r in rows], total
