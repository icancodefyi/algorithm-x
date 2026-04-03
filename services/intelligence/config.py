import os
from pathlib import Path

_BASE = Path(__file__).parent


class _Config:
    PORT: int = int(os.getenv("INTELLIGENCE_PORT", "8002"))
    # Comma-separated list of allowed CORS origins
    ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if o.strip()
    ]
    # Path to the domain intelligence CSV dataset
    DATA_PATH: str = os.getenv(
        "INTELLIGENCE_DATA_PATH", str(_BASE / "data" / "dataset.csv")
    )
    SERVICE_NAME: str = "Sniffer Intelligence Service"
    VERSION: str = "1.0.0"


config = _Config()
