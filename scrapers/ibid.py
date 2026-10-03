"""IBID (Astra) scraper — lifestyle + electronics."""
import re
import requests
from bs4 import BeautifulSoup

BASE = "https://www.ibid.astra.co.id"

def scrape() -> list[dict]:
    """Scrape IBID auction listings."""
    lots = []
    try:
        r = requests.get(f"{BASE}/cari-lelang", timeout=20, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        })
        soup = BeautifulSoup(r.text, "html.parser")

        for card in soup.select(".product-card, .auction-item, [class*='product']"):
            title_el = card.select_one("h3, h4, .title, .name")
            price_el = card.select_one(".price, .harga")
            link_el = card.select_one("a")

            if not title_el:
                continue

            nama = title_el.get_text(strip=True)
            harga_text = price_el.get_text(strip=True) if price_el else "0"
            harga = int(re.sub(r"[^\d]", "", harga_text) or 0)
            link = link_el.get("href", "") if link_el else ""

            lot = {
                "id": f"ibid-{hash(nama)}",
                "nama": nama,
                "kategori": "Elektronik" if any(k in nama.lower() for k in ["laptop", "server", "router", "elektronik", "gadget"]) else "Lain-lain",
                "harga_lelang": harga,
                "lokasi": "",
                "kpknl": "",
                "deadline": "",
                "link": link if link.startswith("http") else BASE + link,
                "foto": [],
                "sumber": "IBID",
            }
            lots.append(lot)
    except Exception as e:
        print(f"IBID scrape error: {e}")

    return lots
