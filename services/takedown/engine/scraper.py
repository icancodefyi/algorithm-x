"""
Async live-scrape fallback.
Only called when a domain is NOT found in the dataset.
Uses a single HTTP request to the homepage — no Playwright, no following links.
Keeps the service fast and stateless.
"""

import re
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

_REMOVAL_KEYWORDS = (
    "dmca", "removal", "report-content", "report_content",
    "takedown", "copyright", "abuse", "legal", "complaint", "privacy",
)

_EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

_BAD_EMAIL_FRAGMENTS = (
    "vanilla-lazyload", "beacon.min", "schema.org", "fonts.google",
    "@1.", "@2.", "@0.", "example.", "noreply", "no-reply",
)

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


class ScrapeResult:
    __slots__ = ("removal_page", "removal_type", "contact_email")

    def __init__(
        self,
        removal_page: Optional[str],
        removal_type: Optional[str],
        contact_email: Optional[str],
    ):
        self.removal_page = removal_page
        self.removal_type = removal_type
        self.contact_email = contact_email


async def scrape_domain(domain: str, timeout: float = 5.0) -> Optional[ScrapeResult]:
    """
    Fetch the homepage of *domain* and look for takedown/removal contacts.
    Returns None if the site is unreachable.
    """
    url = f"https://{domain}"
    try:
        async with httpx.AsyncClient(
            verify=False,
            follow_redirects=True,
            timeout=timeout,
            headers=_HEADERS,
        ) as client:
            resp = await client.get(url)
            if resp.status_code >= 400 or len(resp.text) < 50:
                return None
            html = resp.text
    except Exception:
        return None

    return _parse(html, domain)


def _parse(html: str, domain: str) -> ScrapeResult:
    soup = BeautifulSoup(html, "html.parser")

    removal_link: Optional[str] = None
    removal_type: Optional[str] = None
    contact_email: Optional[str] = None

    # --- 1. find best removal-related anchor --------------------------------
    best_score = -1
    for a in soup.find_all("a", href=True):
        href: str = a["href"].strip()
        text: str = a.get_text(" ", strip=True).lower()
        combined = (href + " " + text).lower()

        score = sum(1 for kw in _REMOVAL_KEYWORDS if kw in combined)
        if score > best_score:
            best_score = score
            removal_link = _absolute(href, domain)

    # --- 2. extract email from visible text ----------------------------------
    for match in _EMAIL_RE.findall(soup.get_text(" ")):
        if _is_valid_email(match):
            contact_email = match
            break

    # --- 3. infer removal type ----------------------------------------------
    if removal_link:
        rl = removal_link.lower()
        if "form" in rl or soup.find("form"):
            removal_type = "form"
        elif contact_email:
            removal_type = "email"
        else:
            removal_type = "form"

    return ScrapeResult(removal_link, removal_type, contact_email)


def _absolute(href: str, domain: str) -> str:
    if href.startswith("http"):
        return href
    return urljoin(f"https://{domain}", href)


def _is_valid_email(email: str) -> bool:
    el = email.lower()
    if any(bad in el for bad in _BAD_EMAIL_FRAGMENTS):
        return False
    parts = el.rsplit("@", 1)
    if len(parts) != 2:
        return False
    tld = parts[1]
    return "." in tld and len(tld) > 4
