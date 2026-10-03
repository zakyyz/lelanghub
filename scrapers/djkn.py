"""DJKN (lelang.go.id) scraper — public API."""
import re
import requests
from html import unescape

BASE = "https://api.lelang.go.id/api/v1/landing-page/katalog-lot-lelang"
LOT_URL = "https://lelang.go.id/lot-lelang/"

# Kategori mapping from DJKN
KATEGORI_MAP = {
    "Elektronik": "Elektronik",
    "Mobil": "Mobil",
    "Motor": "Motor",
    "Mesin": "Mesin",
    "Inventaris": "Inventaris",
    "Besi Tua": "Besi Tua",
    "UMKM": "UMKM",
    "Gudang": "Gudang",
    "Tanah": "Tanah",
    "Rumah": "Rumah",
    "Ruko": "Ruko",
    "Apartemen": "Apartemen",
}

def clean_html(text: str) -> str:
    """Strip HTML tags from lot names."""
    text = unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def guess_kategori(nama: str) -> str:
    """Guess category from lot name."""
    nama_lower = nama.lower()
    for kw, kat in [
        (["laptop", "komputer", "pc", "printer", "server", "router", "monitor", "ups"], "Elektronik"),
        (["mobil", "toyota", "honda", "daihatsu", "suzuki", "mitsubishi"], "Mobil"),
        (["motor", "sepeda motor", "kawasaki", "yamaha"], "Motor"),
        (["genset", "mesin", "pompa", "compactor", "excavator"], "Mesin"),
        (["panel surya", "plts", "baterai", "lithium", "rectifier", "inverter", "battery"], "Elektronik"),
        (["meja", "kursi", "lemari", "rak", "filling"], "Inventaris"),
        (["besi", "scrap", "tua"], "Besi Tua"),
    ]:
        if any(k in nama_lower for k in kw):
            return kat
    return "Lain-lain"

def scrape(limit=200) -> list[dict]:
    """Fetch all lots from DJKN API."""
    lots = []
    offset = 0

    while True:
        r = requests.get(BASE, params={"limit": 100, "offset": offset}, timeout=30)
        data = r.json().get("data", [])
        if not data:
            break

        for item in data:
            nama = clean_html(item.get("namaLotLelang", ""))
            # Extract real photo URLs from nested DJKN photo objects
            foto_urls = []
            for p in item.get("photos", []):
                url = (p.get("file") or {}).get("fileUrl")
                if url:
                    foto_urls.append(url if url.startswith("http") else "https://lelang.go.id" + url)

            lot = {
                "id": f"djkn-{item.get('lotLelangId', '')}",
                "nama": nama,
                "kategori": guess_kategori(nama),
                "harga_lelang": int(item.get("nilaiLimit", 0)),
                "uang_jaminan": int(item.get("uangJaminan", 0)),
                "lokasi": item.get("namaLokasi", ""),
                "kpknl": item.get("namaUnitKerja", ""),
                "deadline": item.get("tglSelesaiLelang", ""),
                "link": LOT_URL + item.get("lotLelangId", ""),
                "foto": foto_urls,
                "sumber": "DJKN",
                "deskripsi": clean_html(item.get("content", {}).get("barangs", [{}])[0].get("deskripsi", "") if item.get("content", {}).get("barangs") else ""),
            }
            lots.append(lot)

        offset += 100
        if offset >= limit:
            break

    return lots
