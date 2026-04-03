import asyncio

from fastapi import APIRouter
from pydantic import BaseModel

from config import config
from engine.loader import lookup, dataset_size
from engine.scraper import scrape_domain

router = APIRouter()


# ── Response model ────────────────────────────────────────────────────────────

class TakedownGuidance(BaseModel):
    domain: str
    found: bool
    removal_type: str | None   # "email" | "form" | "dmca_portal" | "gdpr" | "unknown"
    removal_page: str | None
    contact_email: str | None
    status: str                # "verified" | "partial" | "unverified" | "scraped" | "not_found"
    confidence: float
    source: str                # "dataset" | "scraped" | "not_found"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get(
    "/{domain}",
    response_model=TakedownGuidance,
    summary="Get takedown guidance for a domain",
)
async def get_guidance(domain: str):
    """
    Returns takedown method, removal page URL and contact email for a domain.
    Performs an O(1) dataset lookup first; falls back to a live async scrape
    only when the domain is not in the dataset.
    """
    row = lookup(domain)

    if row is not None:
        return _from_row(domain, row)

    # ── Live-scrape fallback ─────────────────────────────────────────────────
    try:
        result = await asyncio.wait_for(
            scrape_domain(domain, timeout=config.SCRAPE_TIMEOUT),
            timeout=config.SCRAPE_TIMEOUT + 1,
        )
    except asyncio.TimeoutError:
        result = None

    if result and (result.removal_page or result.contact_email):
        rtype = result.removal_type
        return TakedownGuidance(
            domain=domain,
            found=True,
            removal_type=rtype,
            removal_page=result.removal_page,
            contact_email=result.contact_email,
            status="scraped",
            confidence=0.5,
            source="scraped",
        )

    return TakedownGuidance(
        domain=domain,
        found=False,
        removal_type=None,
        removal_page=None,
        contact_email=None,
        status="not_found",
        confidence=0.0,
        source="not_found",
    )


@router.get("/", summary="Dataset stats")
async def stats():
    return {"total_indexed": dataset_size()}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _from_row(domain: str, row: dict) -> TakedownGuidance:
    removal_page = _clean(row.get("removal_page_url"))
    email = _clean(row.get("contact_email"))
    removal_type = _clean(row.get("removal_type"))

    try:
        quality = int(row.get("data_quality", "0"))
    except ValueError:
        quality = 0

    status = _status(quality, removal_page, email)
    confidence = _confidence(quality, removal_page, email)

    return TakedownGuidance(
        domain=domain,
        found=True,
        removal_type=removal_type if removal_type != "unknown" else None,
        removal_page=removal_page,
        contact_email=email,
        status=status,
        confidence=confidence,
        source="dataset",
    )


def _status(quality: int, removal_page: str | None, email: str | None) -> str:
    if quality >= 3 and removal_page and email:
        return "verified"
    if quality >= 2 and (removal_page or email):
        return "partial"
    if quality >= 1:
        return "unverified"
    return "not_found"


def _confidence(quality: int, removal_page: str | None, email: str | None) -> float:
    score = 0.0
    if removal_page:
        score += 0.4
    if email:
        score += 0.4
    if quality >= 3:
        score += 0.2
    elif quality >= 2:
        score += 0.1
    return round(min(score, 1.0), 2)


def _clean(v: str | None) -> str | None:
    if not v:
        return None
    s = v.strip()
    return None if s in ("", ".", "None", "null", "unknown") else s
