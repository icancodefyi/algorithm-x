from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Optional
import hashlib
import io
import time
import uuid

import imagehash
from PIL import Image

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# In-memory store — replace with PostgreSQL in production
_registry: dict[str, dict] = {}

PLATFORM_TAKEDOWN_URLS = {
    "Instagram": "https://help.instagram.com/contact/372592oogds158",
    "Facebook": "https://www.facebook.com/help/contact/1758255661104383",
    "X / Twitter": "https://help.twitter.com/forms/dmca",
    "WhatsApp": "https://www.whatsapp.com/contact/?subject=report",
    "Telegram": "https://telegram.org/dmca",
    "Other": "https://www.cybercrime.gov.in/",
}


class RegistryEntry(BaseModel):
    reference_id: str
    file_hash: str
    image_fingerprint: str
    created_at: float


@router.post("/", response_model=RegistryEntry, status_code=201)
async def register_image(original_image: UploadFile = File(...)):
    if original_image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Allowed: jpg, jpeg, png, webp.",
        )

    file_bytes = await original_image.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit.")

    file_hash = hashlib.sha256(file_bytes).hexdigest()

    # Prevent duplicate registrations of the same image
    for entry in _registry.values():
        if entry["file_hash"] == file_hash:
            return entry

    # Perceptual hash — robust to minor re-encodes, resizes, and colour tweaks
    pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    fingerprint = str(imagehash.phash(pil_img))

    reference_id = str(uuid.uuid4())
    entry = {
        "reference_id": reference_id,
        "file_hash": file_hash,
        "image_fingerprint": fingerprint,
        "created_at": time.time(),
    }
    _registry[reference_id] = entry
    return entry


@router.get("/", response_model=list[RegistryEntry])
def list_registry():
    """Return all registered images."""
    return list(_registry.values())


@router.get("/check/{file_hash}")
def check_hash(file_hash: str):
    """Check if an image hash matches any registered original."""
    for entry in _registry.values():
        if entry["file_hash"] == file_hash:
            return {"match": True, "entry": entry}
    return {"match": False}


class TakedownNoticeRequest(BaseModel):
    platform: str
    description: Optional[str] = None


class TakedownNoticeResponse(BaseModel):
    file_hash: str
    registry_match: bool
    reference_id: Optional[str]
    registered_at: Optional[float]
    platform: str
    report_url: str
    notice_text: str
    generated_at: float


@router.post("/takedown-notice", response_model=TakedownNoticeResponse)
async def generate_takedown_notice(
    image: UploadFile = File(...),
    platform: str = "Other",
    description: Optional[str] = None,
):
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported file type.")

    file_bytes = await image.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit.")

    file_hash = hashlib.sha256(file_bytes).hexdigest()
    now = time.time()

    # Check registry
    matched_entry = None
    for entry in _registry.values():
        if entry["file_hash"] == file_hash:
            matched_entry = entry
            break

    report_url = PLATFORM_TAKEDOWN_URLS.get(platform, PLATFORM_TAKEDOWN_URLS["Other"])

    if matched_entry:
        notice_text = (
            f"TAKEDOWN NOTICE — SNIFFER / IMPIC LABS\n"
            f"Generated: {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime(now))}\n\n"
            f"To: {platform} Trust & Safety / DMCA Team\n\n"
            f"I am the original creator of the image identified by the following cryptographic fingerprint:\n\n"
            f"  SHA-256: {file_hash}\n"
            f"  Protection Reference ID: {matched_entry['reference_id']}\n"
            f"  Registration Date: {time.strftime('%Y-%m-%d', time.gmtime(matched_entry['created_at']))}\n\n"
            f"This image was registered in the Sniffer / Impic Labs Original Image Protection Registry "
            f"prior to its unauthorised appearance on your platform. "
            f"The hash match cryptographically confirms that the image circulating online is identical to my registered original.\n\n"
            + (f"Additional context: {description}\n\n" if description else "")
            + f"I request that you immediately remove the infringing content from your platform "
            f"in accordance with your Terms of Service and applicable law.\n\n"
            f"Submit this report via: {report_url}\n\n"
            f"This notice was generated automatically by Sniffer (https://sniffer.impic.in).\n"
            f"The SHA-256 hash and Protection Reference ID serve as cryptographic evidence of prior ownership."
        )
    else:
        notice_text = (
            f"TAKEDOWN REQUEST — SNIFFER / IMPIC LABS\n"
            f"Generated: {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime(now))}\n\n"
            f"To: {platform} Trust & Safety Team\n\n"
            f"I am reporting an image that I believe constitutes harmful, manipulated, or non-consensual content.\n\n"
            f"  Image SHA-256: {file_hash}\n\n"
            + (f"Context: {description}\n\n" if description else "")
            + f"I request that you review and remove this content from your platform "
            f"in accordance with your Terms of Service and applicable law.\n\n"
            f"Submit this report via: {report_url}\n\n"
            f"This notice was generated by Sniffer (https://sniffer.impic.in)."
        )

    return TakedownNoticeResponse(
        file_hash=file_hash,
        registry_match=matched_entry is not None,
        reference_id=matched_entry["reference_id"] if matched_entry else None,
        registered_at=matched_entry["created_at"] if matched_entry else None,
        platform=platform,
        report_url=report_url,
        notice_text=notice_text,
        generated_at=now,
    )
