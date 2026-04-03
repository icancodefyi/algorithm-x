"""
EXIF metadata extraction.
Detects editing software, camera model, GPS, creation date.
"""
import io
from typing import Optional

from PIL import Image

from .models import MetadataResult

_EDITING_SOFTWARE_KEYWORDS = [
    "photoshop", "gimp", "lightroom", "affinity", "capture one",
    "snapseed", "facetune", "meitu", "pixelmator", "luminar",
    "darktable", "rawtherapee", "paint.net", "canva",
]


def extract_metadata(image_bytes: bytes) -> MetadataResult:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size

        software: Optional[str] = None
        camera_model: Optional[str] = None
        has_gps = False
        creation_date: Optional[str] = None
        exif_present = False

        try:
            import piexif
            exif_dict = piexif.load(image_bytes)

            ifd0 = exif_dict.get("0th", {})
            gps_ifd = exif_dict.get("GPS", {})

            sw_raw = ifd0.get(piexif.ImageIFD.Software)
            if sw_raw:
                software = sw_raw.decode("utf-8", errors="ignore").strip("\x00").strip()

            model_raw = ifd0.get(piexif.ImageIFD.Model)
            if model_raw:
                camera_model = model_raw.decode("utf-8", errors="ignore").strip("\x00").strip()

            dt_raw = ifd0.get(piexif.ImageIFD.DateTime)
            if dt_raw:
                creation_date = dt_raw.decode("utf-8", errors="ignore").strip("\x00").strip()

            has_gps = bool(gps_ifd)
            exif_present = bool(ifd0 or exif_dict.get("Exif", {}))

        except Exception:
            # piexif fails on many PNG/WebP files — that's expected
            exif_present = False

        software_suspicious = bool(
            software and any(kw in software.lower() for kw in _EDITING_SOFTWARE_KEYWORDS)
        )

        if software_suspicious:
            integrity = "anomalies_detected"
        elif not exif_present:
            integrity = "missing"
        else:
            integrity = "ok"

        return MetadataResult(
            width=width,
            height=height,
            exif_present=exif_present,
            software=software,
            camera_model=camera_model,
            has_gps=has_gps,
            creation_date=creation_date,
            software_suspicious=software_suspicious,
            integrity=integrity,
        )

    except Exception:
        return MetadataResult(
            width=0, height=0, exif_present=False, software=None,
            camera_model=None, has_gps=False, creation_date=None,
            software_suspicious=False, integrity="missing",
        )
