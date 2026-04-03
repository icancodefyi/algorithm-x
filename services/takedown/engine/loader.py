import csv
from typing import Optional

# In-memory store keyed on normalised domain.
# Loaded once at startup; treated as read-only after that.
_store: dict[str, dict] = {}


def load_dataset(path: str) -> int:
    global _store
    records: dict[str, dict] = {}
    try:
        with open(path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                domain = _clean_key(row.get("domain", ""))
                if not domain:
                    continue
                # Only store rows that have at least one useful field
                removal_page = _clean(row.get("removal_page_url"))
                email = _clean(row.get("contact_email"))
                removal_type = _clean(row.get("removal_type"))
                if removal_page or email or removal_type:
                    records[domain] = {k: (v or "").strip() for k, v in row.items()}
        _store = records
        return len(_store)
    except FileNotFoundError:
        print(f"[takedown] WARNING: dataset not found at {path}")
        return 0


def lookup(domain: str) -> Optional[dict]:
    key = _clean_key(domain)
    if key in _store:
        return _store[key]
    # Try with / without www.
    if key.startswith("www."):
        alt = key[4:]
    else:
        alt = f"www.{key}"
    return _store.get(alt)


def dataset_size() -> int:
    return len(_store)


# ── helpers ─────────────────────────────────────────────────────────────────

def _clean_key(v: str) -> str:
    return v.strip().lower()


def _clean(v: str | None) -> str | None:
    if not v:
        return None
    s = v.strip()
    return None if s in ("", ".", "None", "null", "unknown") else s
