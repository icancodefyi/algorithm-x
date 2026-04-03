"""
Error Level Analysis (ELA).
Re-saves the image at a known JPEG quality and computes the residual.
Tampered regions that were spliced from other JPEG sources show elevated residuals
because they were compressed at a different quality level.
Works best on JPEG images; still informative on PNG (identifies re-encoded areas).
"""
import base64
import io

import numpy as np
from PIL import Image

from .models import ELAResult

_ELA_QUALITY = 90    # re-save quality
_ELA_SCALE = 15      # amplification factor for visualisation
_ELA_FLAG_THRESHOLD = 8.0  # mean residual above this → suspicious


def run_ela(image_bytes: bytes) -> ELAResult:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Re-save at known quality
        recomp_buf = io.BytesIO()
        img.save(recomp_buf, format="JPEG", quality=_ELA_QUALITY)
        recomp_buf.seek(0)
        recomp = Image.open(recomp_buf).convert("RGB")

        orig_arr = np.array(img, dtype=np.float32)
        recomp_arr = np.array(recomp, dtype=np.float32)

        ela_arr = np.clip(np.abs(orig_arr - recomp_arr) * _ELA_SCALE, 0, 255).astype(np.uint8)
        ela_mean = float(ela_arr.mean())

        ela_img = Image.fromarray(ela_arr)
        buf = io.BytesIO()
        ela_img.save(buf, format="PNG")
        ela_b64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

        return ELAResult(
            ela_mean_residual=round(ela_mean, 3),
            ela_flagged=ela_mean > _ELA_FLAG_THRESHOLD,
            ela_heatmap=ela_b64,
        )

    except Exception:
        return ELAResult(ela_mean_residual=0.0, ela_flagged=False, ela_heatmap=None)
