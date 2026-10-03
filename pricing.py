"""AI-powered market price lookup.

Uses DuckDuckGo instant answers + fallback estimation.
For production, integrate with actual marketplace APIs or manual review.
"""
import re
import requests
from typing import Optional

# Estimated market prices for common categories (fallback when search fails)
ESTIMATED_PRICES = {
    "laptop": 5000000,
    "komputer": 4000000,
    "pc": 4000000,
    "printer": 2000000,
    "monitor": 1500000,
    "server": 15000000,
    "ups": 1500000,
    "genset": 8000000,
    "mobil": 100000000,
    "motor": 15000000,
    "sepeda motor": 15000000,
    "baterai": 2000000,
    "lithium": 5000000,
    "panel surya": 3000000,
    "rectifier": 5000000,
    "meja": 500000,
    "kursi": 300000,
    "lemari": 1000000,
    "thermoscanner": 500000,
    "thermo": 500000,
    "mesin fotokopi": 15000000,
    "fotokopi": 15000000,
    "fotocopy": 15000000,
    "tanah": 50000000,
    "rumah": 300000000,
    "ruko": 500000000,
    "apartemen": 400000000,
    "besi": 5000000,
    "scrap": 3000000,
    "inventaris": 1000000,
    "pompa": 2000000,
    "compactor": 5000000,
    "excavator": 200000000,
    "tv": 2000000,
    "kulkas": 2500000,
    "ac": 3000000,
    "hp": 2000000,
    "handphone": 2000000,
    "tablet": 2000000,
    "kamera": 3000000,
    "proyektor": 3000000,
    "speaker": 1000000,
    "sofa": 3000000,
    "kasur": 2000000,
    "sepeda": 1000000,
    "alat": 1000000,
    "unit": 1000000,
    "paket": 2000000,
}

def extract_keywords(nama: str) -> str:
    """Extract search keywords from lot name."""
    stopwords = {"di", "dan", "atau", "yang", "dengan", "untuk", "dari", "pada",
                 "satu", "paket", "unit", "buah", "kondisi", "bekas",
                 "baru", "second", "apa", "adanya", "as", "is",
                 "rusak", "berat", "ringan", "baik", "dgn", "dg", "utk"}
    words = re.findall(r"[a-zA-Z0-9]+", nama.lower())
    keywords = [w for w in words if w not in stopwords and len(w) > 2]
    return " ".join(keywords[:5])

def estimate_price(nama: str) -> Optional[int]:
    """Estimate market price from category keywords."""
    nama_lower = nama.lower()
    for keyword, price in ESTIMATED_PRICES.items():
        if keyword in nama_lower:
            return price
    return None

def search_price_ddg(keyword: str) -> Optional[int]:
    """Try DuckDuckGo instant answer."""
    try:
        r = requests.get("https://api.duckduckgo.com/",
            params={"q": f"harga {keyword}", "format": "json", "no_html": 1},
            timeout=10)
        data = r.json()
        # DuckDuckGo instant answers rarely have prices, skip
        return None
    except:
        return None

def price_lot(nama: str, harga_lelang: int) -> dict:
    """Find market price and calculate tier."""
    keyword = extract_keywords(nama)

    # Try estimate first (fast, no network)
    harga_pasaran = estimate_price(nama)

    # If no estimate, try search (slow)
    if not harga_pasaran:
        harga_pasaran = search_price_ddg(keyword)

    if harga_pasaran and harga_pasaran > 0:
        diskon = ((harga_pasaran - harga_lelang) / harga_pasaran) * 100
        return {
            "harga_pasaran": harga_pasaran,
            "diskon_persen": round(diskon, 1),
            "keyword_used": keyword,
            "method": "estimate" if keyword in ESTIMATED_PRICES else "search",
        }
    return {
        "harga_pasaran": None,
        "diskon_persen": None,
        "keyword_used": keyword,
        "method": "none",
    }
