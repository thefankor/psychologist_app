from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

STATIC_BASE_URL = "/static"
STATIC_ROOT = BASE_DIR / "static"
