from fastapi import APIRouter
from pydantic import BaseModel

from engine.loader import lookup, dataset_size

router = APIRouter()

# ---------------------------------------------------------------------------
# Network inference: map known CDN hostnames → distribution network names.
# Add entries here as more networks are confirmed.
# ---------------------------------------------------------------------------
_CDN_TO_NETWORK: dict[str, str] = {
    "ttcache.com": "TubeTraffic",
    "c1.ttcache.com": "TubeTraffic",
    "c2.ttcache.com": "TubeTraffic",
    "sacdnssedge.com": "IndianPornEmpire",
    "ltdcdn.net": "LTDNetwork",
    "pornhub.com": "MindGeek",
    "xvideos.com": "XVideos",
    "xhcdn.com": "XVideos",
    "xhpingcdn.com": "XVideos",
    "xnxx.com": "XVideos",
    "xnxx-cdn.com": "XVideos",
    "redtube.com": "MindGeek",
    "ypimg.com": "MindGeek",
    "youporn.com": "MindGeek",
    "dtscout.com": "TrafficJunky",
    "go.indiancamxxx.com": "IndianCamXxx",
}

_VALID_PROVIDER_TYPES = {
    "external_cdn",
    "self_or_private_cdn",
    "api_stream",
    "embedded_player",
    "embedded_tube",
}


# ---------------------------------------------------------------------------
# Response model — matches the schema agreed in the product spec
# ---------------------------------------------------------------------------
class PlatformIntelligence(BaseModel):
    domain: str
    found: bool
    cdn_provider: str | None
    provider_type: str | None
    network: str | None
    confidence: float
    source: str  # "dataset" | "not_found"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get(
    "/{domain}",
    response_model=PlatformIntelligence,
    summary="Get platform intelligence for a domain",
)
async def get_intelligence(domain: str):
    """
    Return CDN provider, provider type, and network for the given domain.
    Performs an O(1) in-memory lookup against the pre-loaded dataset.
    If the domain is not in the dataset, `found` will be false.
    """
    row = lookup(domain)

    if row is None:
        return PlatformIntelligence(
            domain=domain,
            found=False,
            cdn_provider=None,
            provider_type=None,
            network=None,
            confidence=0.0,
            source="not_found",
        )

    cdn = _clean(row.get("video_provider")) or _clean(row.get("cdn_provider"))
    provider_type = _clean(row.get("provider_type"))

    # Resolve network: use stored value if meaningful, otherwise infer from CDN
    network = _clean(row.get("network"))
    if not network or network.lower() == "unknownnetwork":
        network = _infer_network(cdn)

    return PlatformIntelligence(
        domain=domain,
        found=True,
        cdn_provider=cdn,
        provider_type=provider_type if provider_type in _VALID_PROVIDER_TYPES else None,
        network=network,
        confidence=_confidence(provider_type, network, cdn),
        source="dataset",
    )


@router.get(
    "/",
    summary="Dataset stats",
)
async def stats():
    """Returns the number of domains currently indexed in memory."""
    return {"total_indexed": dataset_size()}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean(value: str | None) -> str | None:
    """Return None for empty / placeholder values."""
    if not value:
        return None
    v = value.strip()
    if v in ("", ".", "None", "null"):
        return None
    return v


def _infer_network(cdn: str | None) -> str | None:
    if not cdn:
        return None
    cdn_lower = cdn.lower()
    for key, network in _CDN_TO_NETWORK.items():
        if key in cdn_lower:
            return network
    return None


def _confidence(provider_type: str | None, network: str | None, cdn: str | None) -> float:
    """
    Confidence score (0.0–1.0) based on how much intelligence we have.
    - Known provider_type       → +0.5
    - Resolved network          → +0.3
    - Known CDN provider        → +0.2
    """
    score = 0.0
    if provider_type and provider_type in _VALID_PROVIDER_TYPES:
        score += 0.5
    if network:
        score += 0.3
    if cdn:
        score += 0.2
    return round(score, 2)
