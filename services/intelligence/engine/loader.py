import csv
from pathlib import Path
from typing import Optional

# In-memory store: normalised domain → row dict
# Populated once at startup via load_dataset(); never mutated after that.
_store: dict[str, dict] = {}


def load_dataset(path: str) -> int:
    """
    Read CSV into memory. Returns number of domains indexed.
    Safe to call multiple times (replaces previous data).
    """
    global _store
    records: dict[str, dict] = {}
    try:
        with open(path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                domain = _normalise(row.get("domain", ""))
                if domain:
                    records[domain] = {k: (v or "").strip() for k, v in row.items()}
        _store = records
        return len(_store)
    except FileNotFoundError:
        print(f"[intelligence] WARNING: dataset not found at {path}")
        return 0


def lookup(domain: str) -> Optional[dict]:
    """
    O(1) domain lookup. Tries bare domain, then strips/adds www. prefix.
    Returns the raw CSV row dict, or None if not found.
    """
    key = _normalise(domain)

    if key in _store:
        return _store[key]

    # Try stripping www.
    if key.startswith("www."):
        alt = key[4:]
        if alt in _store:
            return _store[alt]
    else:
        alt = f"www.{key}"
        if alt in _store:
            return _store[alt]

    return None


def dataset_size() -> int:
    return len(_store)


def _normalise(domain: str) -> str:
    return domain.strip().lower()
