"""Koelak.co.id scraper — ex-Telkomsel assets."""
import re
import requests
from bs4 import BeautifulSoup

BASE = "https://koelak.co.id"

def scrape() -> list[dict]:
    """Scrape active auctions from Koelak."""
    lots = []
    try:
        r = requests.get(f"{BASE}/lelang", timeout=20, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        })
        soup = BeautifulSoup(r.text, "html.parser")

        for card in soup.select(".lelang-card, .auction-card, [class*='lelang'], [class*='lot']"):
            title_el = card.select_one("h3, h4, .title, .nama")
            price_el = card.select_one(".price, .harga, .limit")
            link_el = card.select_one("a[href*='lelang']")

            if not title_el:
                continue

            nama = title_el.get_text(strip=True)
            harga_text = price_el.get_text(strip=True) if price_el else "0"
            harga = int(re.sub(r"[^\d]", "", harga_text) or 0)
            link = link_el["href"] if link_el else ""

            lot = {
                "id": f"koelak-{hash(nama)}",
                "nama": nama,
                "kategori": "Elektronik" if any(k in nama.lower() for k in ["baterai", "battery", "rectifier", "server", "ups", "tower", "bts"]) else "Lain-lain",
                "harga_lelang": harga,
                "lokasi": "",
                "kpknl": "",
                "deadline": "",
                "link": link if link.startswith("http") else BASE + link,
                "foto": [],
                "sumber": "KOELAK",
            }
            lots.append(lot)
    except Exception as e:
        print(f"Koelak scrape error: {e}")

    return lots
