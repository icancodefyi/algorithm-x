from __future__ import annotations

import csv
import io
from pathlib import Path
import time
from typing import Callable, Iterable, Optional
from urllib.parse import urljoin, urlparse

import imagehash
import requests
from bs4 import BeautifulSoup
from PIL import Image, UnidentifiedImageError

from .models import DiscoveryMatch, DiscoveryRelatedDomain, DiscoveryResult
from .similarity import compute_similarity

DATASET_PATH = Path(__file__).resolve().parents[2] / "intelligence" / "data" / "dataset.csv"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}
CONTENT_LINK_KEYWORDS = (
    "video",
    "watch",
    "clip",
    "mms",
    "gallery",
    "post",
    "scene",
    "episode",
)
DEMO_TARGET_DOMAINS = [
    "fsiblog.pro",
    "mydesi.ltd",
    "auntymaza.video",
    "mydesi.click",
    "auntymaza.watch",
]
MAX_PAGES_PER_DOMAIN = 10
MAX_ASSETS_PER_PAGE = 24
MAX_IMAGE_BYTES = 3 * 1024 * 1024
DEMO_DISCOVERY_MODE = True
DEMO_MATCH_URLS = [
    "https://mydesi.ltd/exclusive-young-cute-slim-mallu-girl-teasing-nipples-2/",
    "https://fsiblog.pro/exclusive-young-cute-slim-mallu-girl-teasing-nipples-2/",
]


def run_discovery_scan(
    case_id: str,
    suspicious_bytes: bytes,
    origin_domain: Optional[str] = None,
    progress_cb: Optional[Callable[[dict], None]] = None,
) -> DiscoveryResult:
    started_at = time.time()
    rows = _load_dataset_rows()

    if DEMO_DISCOVERY_MODE:
        return _build_demo_discovery_result(case_id=case_id, started_at=started_at, rows=rows)

    prioritized_network = _find_network(origin_domain, rows) if origin_domain else None
    domains = _select_domains(rows)

    target_hashes = _compute_hashes(suspicious_bytes)
    direct_matches: list[DiscoveryMatch] = []
    matched_keys: set[tuple[str, str]] = set()
    domains_scanned = 0
    pages_scanned = 0
    candidates_evaluated = 0
    events: list[dict] = []

    def emit_event(event_type: str, message: str, **kwargs):
        """Emit an event and call progress callback."""
        event = {
            "timestamp": time.time(),
            "type": event_type,
            "message": message,
            **kwargs,
        }
        events.append(event)
        if progress_cb:
            progress_cb({"event": event})

    for row in domains:
        domain = row["domain"]
        domain_base = f"https://{domain}"
        
        emit_event(
            "domain",
            f"Scanning {domain}...",
            domain=domain,
        )
        
        try:
            page_candidates = _discover_pages(domain_base)
            emit_event(
                "info",
                f"Found {len(page_candidates)} content pages on {domain}",
                domain=domain,
            )
        except Exception as e:
            page_candidates = [domain_base]
            emit_event(
                "info",
                f"Could not discover pages on {domain}, scanning homepage only",
                domain=domain,
            )

        for page_url in page_candidates[:MAX_PAGES_PER_DOMAIN]:
            html = _fetch_html(page_url)
            if not html:
                continue

            pages_scanned += 1
            emit_event(
                "page",
                f"Analyzing {page_url}",
                domain=domain,
                page_url=page_url,
            )
            
            asset_urls = _extract_asset_urls(html, page_url)
            emit_event(
                "info",
                f"Found {len(asset_urls)} images on this page",
                domain=domain,
                page_url=page_url,
            )
            
            for asset_url, asset_type in asset_urls[:MAX_ASSETS_PER_PAGE]:
                image_bytes = _fetch_image(asset_url)
                if not image_bytes:
                    continue
                candidates_evaluated += 1
                
                match = _match_candidate(
                    suspicious_bytes=suspicious_bytes,
                    target_hashes=target_hashes,
                    candidate_bytes=image_bytes,
                    domain=row["domain"],
                    network=row.get("network") or None,
                    provider_type=row.get("provider_type") or None,
                    page_url=page_url,
                    image_url=asset_url,
                    asset_type=asset_type,
                )
                
                if match:
                    dedupe_key = (match.domain, match.image_url)
                    if dedupe_key in matched_keys:
                        continue
                    matched_keys.add(dedupe_key)
                    direct_matches.append(match)
                    
                    emit_event(
                        "match",
                        f"Found {match.match_type} visual match on {domain}",
                        domain=domain,
                        page_url=page_url,
                        image_url=asset_url,
                        asset_type=asset_type,
                        match_type=match.match_type,
                        confidence=match.confidence,
                        ssim_score=match.ssim_score,
                    )
                else:
                    emit_event(
                        "asset",
                        f"Checked {asset_type} - no match",
                        domain=domain,
                        page_url=page_url,
                        asset_url=asset_url,
                        asset_type=asset_type,
                    )

            if progress_cb:
                progress_cb(
                    {
                        "pages_scanned": pages_scanned,
                        "candidates_evaluated": candidates_evaluated,
                        "events": events[-5:],  # Send last 5 events
                    }
                )

        domains_scanned += 1
        emit_event(
            "info",
            f"Completed scanning {domain}",
            domain=domain,
        )
        if progress_cb:
            progress_cb({"domains_scanned": domains_scanned, "events": events[-5:]})

    direct_matches.sort(key=lambda item: item.confidence, reverse=True)
    top_matches = direct_matches[:12]
    related_domains = _expand_related_domains(top_matches, rows)
    
    emit_event("info", "Scan complete!")

    return DiscoveryResult(
        case_id=case_id,
        status="completed",
        started_at=started_at,
        finished_at=time.time(),
        prioritized_network=prioritized_network,
        target_domains=DEMO_TARGET_DOMAINS,
        domains_scanned=domains_scanned,
        pages_scanned=pages_scanned,
        candidates_evaluated=candidates_evaluated,
        direct_matches=[match.model_dump() for match in top_matches],
        related_domains=[item.model_dump() for item in related_domains[:12]],
        recent_events=[event for event in events],
    )


def _build_demo_discovery_result(
    case_id: str,
    started_at: float,
    rows: list[dict[str, str]],
) -> DiscoveryResult:
    now = time.time()
    row_by_domain = {row.get("domain", "").lower(): row for row in rows}

    def meta(domain: str) -> tuple[Optional[str], Optional[str]]:
        record = row_by_domain.get(domain.lower())
        if not record:
            return None, None
        network = (record.get("network") or "").strip() or None
        provider_type = (record.get("provider_type") or "").strip() or None
        return network, provider_type

    mydesi_network, mydesi_provider = meta("mydesi.ltd")
    fsiblog_network, fsiblog_provider = meta("fsiblog.pro")

    direct_matches = [
        DiscoveryMatch(
            domain="mydesi.ltd",
            network=mydesi_network,
            provider_type=mydesi_provider,
            page_url=DEMO_MATCH_URLS[0],
            image_url="https://files.ltdcdn.net/upload/photos/2026/03/G955zPLeXbgmPvBLfRPq_12_d6e75fde8aa83204001a3927692fb4eb_image.jpg",
            asset_type="poster",
            confidence=96.4,
            match_type="exact",
            phash_distance=1,
            dhash_distance=2,
            ahash_distance=1,
            ssim_score=0.92,
        ).model_dump(),
        DiscoveryMatch(
            domain="fsiblog.pro",
            network=fsiblog_network,
            provider_type=fsiblog_provider,
            page_url=DEMO_MATCH_URLS[1],
            image_url="https://files.ltdcdn.net/upload/photos/2026/03/G955zPLeXbgmPvBLfRPq_12_d6e75fde8aa83204001a3927692fb4eb_image.jpg",
            asset_type="poster",
            confidence=94.8,
            match_type="exact",
            phash_distance=2,
            dhash_distance=2,
            ahash_distance=2,
            ssim_score=0.89,
        ).model_dump(),
    ]

    related_domains = [
        DiscoveryRelatedDomain(
            domain="mydesi.click",
            network=mydesi_network or "DemoScope",
            provider_type="manual_target",
            reason="Shares naming pattern and affiliate-style linking with mydesi.ltd",
        ).model_dump(),
    ]

    recent_events = [
        {
            "timestamp": started_at + 0.2,
            "type": "domain",
            "message": "Scanning mydesi.ltd...",
            "domain": "mydesi.ltd",
        },
        {
            "timestamp": started_at + 0.5,
            "type": "match",
            "message": "Found exact visual match on mydesi.ltd",
            "domain": "mydesi.ltd",
            "page_url": DEMO_MATCH_URLS[0],
            "asset_type": "poster",
            "match_type": "exact",
            "confidence": 96.4,
        },
        {
            "timestamp": started_at + 0.8,
            "type": "domain",
            "message": "Scanning fsiblog.pro...",
            "domain": "fsiblog.pro",
        },
        {
            "timestamp": started_at + 1.1,
            "type": "match",
            "message": "Found exact visual match on fsiblog.pro",
            "domain": "fsiblog.pro",
            "page_url": DEMO_MATCH_URLS[1],
            "asset_type": "poster",
            "match_type": "exact",
            "confidence": 94.8,
        },
        {
            "timestamp": now,
            "type": "info",
            "message": "Demo scan complete.",
        },
    ]

    return DiscoveryResult(
        case_id=case_id,
        status="completed",
        started_at=started_at,
        finished_at=now,
        prioritized_network=mydesi_network or fsiblog_network,
        target_domains=["mydesi.ltd", "fsiblog.pro"],
        domains_scanned=2,
        pages_scanned=2,
        candidates_evaluated=6,
        direct_matches=direct_matches,
        related_domains=related_domains,
        recent_events=recent_events,
    )


def _load_dataset_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    try:
        with open(DATASET_PATH, newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                domain = (row.get("domain") or "").strip().lower()
                if not domain:
                    continue
                provider_type = (row.get("provider_type") or "").strip().lower()
                if provider_type == "unknown":
                    continue
                if domain.endswith(".edu"):
                    continue
                rows.append({k: (v or "").strip() for k, v in row.items()})
    except FileNotFoundError:
        return []
    return rows


def _find_network(origin_domain: Optional[str], rows: Iterable[dict[str, str]]) -> Optional[str]:
    if not origin_domain:
        return None

    clean_domain = origin_domain.strip().lower()
    for row in rows:
        if row.get("domain", "").lower() == clean_domain:
            network = row.get("network") or ""
            return network if network and network != "UnknownNetwork" else None
    return None


def _select_domains(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    selected: list[dict[str, str]] = []
    by_domain = {row.get("domain", ""): row for row in rows}

    for domain in DEMO_TARGET_DOMAINS:
        row = by_domain.get(domain)
        if row is not None:
            selected.append(row)
            continue

        selected.append(
            {
                "domain": domain,
                "network": "DemoScope",
                "provider_type": "manual_target",
            }
        )

    return selected


def _discover_pages(domain_base: str) -> list[str]:
    html = _fetch_html(domain_base)
    if not html:
        return [domain_base]

    pages = [domain_base]
    soup = BeautifulSoup(html, "html.parser")
    seen = {domain_base}
    base_host = urlparse(domain_base).netloc

    for anchor in soup.find_all("a", href=True):
        href = anchor.get("href", "")
        absolute = urljoin(domain_base, href)
        parsed = urlparse(absolute)
        if parsed.scheme not in {"http", "https"}:
            continue
        if parsed.netloc != base_host:
            continue
        candidate = absolute.split("#", 1)[0]
        if any(keyword in candidate.lower() for keyword in CONTENT_LINK_KEYWORDS) and candidate not in seen:
            pages.append(candidate)
            seen.add(candidate)
        if len(pages) >= MAX_PAGES_PER_DOMAIN:
            break

    return pages


def _fetch_html(url: str) -> Optional[str]:
    try:
        response = requests.get(url, headers=HEADERS, timeout=8)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type:
            return None
        return response.text
    except requests.RequestException:
        return None


def _extract_asset_urls(html: str, page_url: str) -> list[tuple[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    assets: list[tuple[str, str]] = []
    seen: set[str] = set()

    def add_asset(raw_url: Optional[str], asset_type: str) -> None:
        if not raw_url:
            return
        full_url = urljoin(page_url, raw_url.strip())
        parsed = urlparse(full_url)
        if parsed.scheme not in {"http", "https"}:
            return
        if full_url in seen:
            return
        seen.add(full_url)
        assets.append((full_url, asset_type))

    for tag in soup.find_all("meta"):
        prop = (tag.get("property") or tag.get("name") or "").lower()
        if prop in {"og:image", "twitter:image"}:
            add_asset(tag.get("content"), "meta_preview")

    for image in soup.find_all("img", src=True):
        add_asset(image.get("src"), "thumbnail")
        if len(assets) >= MAX_ASSETS_PER_PAGE:
            return assets

    for video in soup.find_all("video"):
        add_asset(video.get("poster"), "poster")
        if len(assets) >= MAX_ASSETS_PER_PAGE:
            return assets

    return assets


def _fetch_image(url: str) -> Optional[bytes]:
    try:
        response = requests.get(url, headers=HEADERS, timeout=8)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "")
        if "image" not in content_type:
            return None
        if len(response.content) > MAX_IMAGE_BYTES:
            return None
        return response.content
    except requests.RequestException:
        return None


def _compute_hashes(image_bytes: bytes) -> dict[str, imagehash.ImageHash]:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return {
        "phash": imagehash.phash(image),
        "dhash": imagehash.dhash(image),
        "ahash": imagehash.average_hash(image),
    }


def _match_candidate(
    suspicious_bytes: bytes,
    target_hashes: dict[str, imagehash.ImageHash],
    candidate_bytes: bytes,
    domain: str,
    network: Optional[str],
    provider_type: Optional[str],
    page_url: str,
    image_url: str,
    asset_type: str,
) -> Optional[DiscoveryMatch]:
    try:
        candidate_hashes = _compute_hashes(candidate_bytes)
    except (UnidentifiedImageError, OSError, ValueError):
        return None

    phash_distance = int(target_hashes["phash"] - candidate_hashes["phash"])
    dhash_distance = int(target_hashes["dhash"] - candidate_hashes["dhash"])
    ahash_distance = int(target_hashes["ahash"] - candidate_hashes["ahash"])
    avg_distance = (phash_distance + dhash_distance + ahash_distance) / 3

    try:
        similarity, _ = compute_similarity(suspicious_bytes, candidate_bytes)
        ssim_score = similarity.ssim_score
    except Exception:
        ssim_score = 0.0

    hash_score = max(0.0, 1.0 - (avg_distance / 16.0))
    confidence = round(((hash_score * 0.75) + (ssim_score * 0.25)) * 100, 1)

    is_direct_match = avg_distance <= 6 and ssim_score >= 0.55
    is_near_duplicate = avg_distance <= 10 and ssim_score >= 0.35
    is_probable = avg_distance <= 12 and (phash_distance <= 10 or ssim_score >= 0.3)

    if is_direct_match:
        match_type = "exact"
    elif is_near_duplicate:
        match_type = "near_duplicate"
    elif is_probable:
        match_type = "probable"
    else:
        return None

    return DiscoveryMatch(
        domain=domain,
        network=network,
        provider_type=provider_type,
        page_url=page_url,
        image_url=image_url,
        asset_type=asset_type,
        confidence=confidence,
        match_type=match_type,
        phash_distance=phash_distance,
        dhash_distance=dhash_distance,
        ahash_distance=ahash_distance,
        ssim_score=round(ssim_score, 3),
    )


def _expand_related_domains(
    matches: list[DiscoveryMatch],
    rows: list[dict[str, str]],
) -> list[DiscoveryRelatedDomain]:
    related: list[DiscoveryRelatedDomain] = []
    seen: set[str] = {match.domain for match in matches}
    matched_networks = {
        match.network
        for match in matches
        if match.network and match.network != "UnknownNetwork"
    }

    for network in matched_networks:
        for row in rows:
            domain = row.get("domain", "")
            if row.get("network") != network or domain in seen:
                continue
            seen.add(domain)
            related.append(
                DiscoveryRelatedDomain(
                    domain=domain,
                    network=network,
                    provider_type=row.get("provider_type") or None,
                    reason="Same network as a visually matched domain; likely mirror or sister site.",
                )
            )

    return related