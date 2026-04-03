import os
from pathlib import Path

_BASE = Path(__file__).parent


class _Config:
    PORT: int = int(os.getenv("TAKEDOWN_PORT", "8003"))
    ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if o.strip()
    ]
    DATA_PATH: str = os.getenv(
        "TAKEDOWN_DATA_PATH", str(_BASE / "data" / "dataset.csv")
    )
    # How long (seconds) to wait for live-scrape fallback
    SCRAPE_TIMEOUT: float = float(os.getenv("SCRAPE_TIMEOUT", "5"))
    SERVICE_NAME: str = "Sniffer Takedown Service"
    VERSION: str = "1.0.0"


config = _Config()
