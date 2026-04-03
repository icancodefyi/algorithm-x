"""
Tamper heatmap generation from pixel diff array.
Applies a jet-like colormap and blends it onto the suspicious image.
Also extracts tamper region bounding boxes via morphological operations.
Uses only numpy + Pillow + scipy (no opencv required for basic heatmap).
"""
import base64
import io
from typing import Optional

import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing, binary_opening, label as scipy_label

from .models import TamperRegion

_DIFF_THRESHOLD = 30     # pixel diff > this is a "changed" pixel
_MIN_REGION_PX = 150     # ignore regions smaller than this
_MAX_REGIONS = 10        # return at most this many regions
_ALPHA = 0.40            # heatmap blend strength


def _jet_colormap(gray: np.ndarray) -> np.ndarray:
    """Pure-numpy approximation of the matplotlib jet colormap (uint8 input → RGB uint8)."""
    v = gray.astype(np.float32) / 255.0
    r = np.clip(1.5 - np.abs(4.0 * v - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(4.0 * v - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(4.0 * v - 1.0), 0.0, 1.0)
    return (np.stack([r, g, b], axis=-1) * 255).astype(np.uint8)


def build_heatmap(
    diff_array: np.ndarray,
    suspicious_bytes: bytes,
) -> tuple[Optional[str], list[TamperRegion]]:
    """
    diff_array: uint8 (H, W, 3) absolute pixel differences.
    Returns (blended_heatmap_b64, tamper_regions).
    """
    try:
        diff_gray = np.clip(diff_array.mean(axis=2), 0, 255).astype(np.uint8)

        # Build jet heatmap and blend onto suspicious image
        heatmap_rgb = _jet_colormap(diff_gray)

        susp_img = Image.open(io.BytesIO(suspicious_bytes)).convert("RGB")
        susp_arr = np.array(susp_img, dtype=np.float32)

        h, w = susp_arr.shape[:2]
        # Resize heatmap to match suspicious (in case of minor rounding differences)
        if heatmap_rgb.shape[:2] != (h, w):
            heatmap_rgb = np.array(
                Image.fromarray(heatmap_rgb).resize((w, h), Image.LANCZOS)
            )

        blended = np.clip(
            susp_arr * (1.0 - _ALPHA) + heatmap_rgb.astype(np.float32) * _ALPHA,
            0, 255,
        ).astype(np.uint8)

        blended_img = Image.fromarray(blended)
        buf = io.BytesIO()
        blended_img.save(buf, format="PNG")
        heatmap_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

        # --- Tamper region extraction ---
        mask = diff_gray > _DIFF_THRESHOLD

        # Morphological clean-up
        struct = np.ones((5, 5), dtype=bool)
        mask = binary_closing(mask, structure=struct)
        mask = binary_opening(mask, structure=struct)

        labeled, num_features = scipy_label(mask)
        total_pixels = h * w

        tamper_regions: list[TamperRegion] = []
        for region_id in range(1, num_features + 1):
            region_mask = labeled == region_id
            area = int(region_mask.sum())
            if area < _MIN_REGION_PX:
                continue

            rows = np.where(region_mask.any(axis=1))[0]
            cols = np.where(region_mask.any(axis=0))[0]
            y0, y1 = int(rows.min()), int(rows.max())
            x0, x1 = int(cols.min()), int(cols.max())

            tamper_regions.append(
                TamperRegion(
                    id=len(tamper_regions) + 1,
                    bbox={"x": x0, "y": y0, "w": x1 - x0 + 1, "h": y1 - y0 + 1},
                    area_pct=round(area / total_pixels * 100, 2),
                    type="splice",
                )
            )

        # Sort largest first, cap at _MAX_REGIONS
        tamper_regions.sort(key=lambda r: r.area_pct, reverse=True)
        return heatmap_b64, tamper_regions[:_MAX_REGIONS]

    except Exception:
        return None, []
