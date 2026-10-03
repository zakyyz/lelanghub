"""Tier calculation — discount from market price."""

def calc_tier(harga_lelang: int, harga_pasaran: int) -> tuple[str, float]:
    """Return (tier, diskon_persen)."""
    if not harga_pasaran or harga_pasaran <= 0:
        return "?", 0.0

    diskon = ((harga_pasaran - harga_lelang) / harga_pasaran) * 100

    if diskon >= 70:
        return "S", round(diskon, 1)
    elif diskon >= 50:
        return "A", round(diskon, 1)
    elif diskon >= 30:
        return "B", round(diskon, 1)
    elif diskon >= 10:
        return "C", round(diskon, 1)
    else:
        return "D", round(diskon, 1)

def tier_badge(tier: str) -> str:
    """Emoji badge for tier."""
    return {"S": "🥇", "A": "🥈", "B": "🥉", "C": "📦", "D": "⚠️"}.get(tier, "❓")
