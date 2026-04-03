"""
Per-channel color histogram KL-divergence between suspicious and reference image.
Spliced regions from a different source introduce color profile mismatches
that manifest as elevated KL-divergence even when SSIM is borderline.
"""
import io

import numpy as np
from PIL import Image

from .models import ColorHistResult

_BINS = 64
_FLAG_THRESHOLD = 0.10  # mean KL-div above this → suspicious
_EPS = 1e-10


def run_color_analysis(suspicious_bytes: bytes, reference_bytes: bytes) -> ColorHistResult:
    try:
        susp_img = Image.open(io.BytesIO(suspicious_bytes)).convert("RGB")
        ref_img = Image.open(io.BytesIO(reference_bytes)).convert("RGB").resize(
            susp_img.size, Image.LANCZOS
        )

        susp_arr = np.array(susp_img, dtype=np.float32)
        ref_arr = np.array(ref_img, dtype=np.float32)

        kl_divs: list[float] = []
        for ch in range(3):
            s_hist, _ = np.histogram(susp_arr[:, :, ch], bins=_BINS, range=(0, 256), density=True)
            r_hist, _ = np.histogram(ref_arr[:, :, ch], bins=_BINS, range=(0, 256), density=True)

            s_hist = s_hist + _EPS
            r_hist = r_hist + _EPS
            s_hist /= s_hist.sum()
            r_hist /= r_hist.sum()

            kl = float(np.sum(s_hist * np.log(s_hist / r_hist)))
            kl_divs.append(kl)

        mean_kl = float(np.mean(kl_divs))

        return ColorHistResult(
            kl_divergence_r=round(kl_divs[0], 4),
            kl_divergence_g=round(kl_divs[1], 4),
            kl_divergence_b=round(kl_divs[2], 4),
            kl_divergence_mean=round(mean_kl, 4),
            flagged=mean_kl > _FLAG_THRESHOLD,
        )

    except Exception:
        return ColorHistResult(
            kl_divergence_r=0.0, kl_divergence_g=0.0, kl_divergence_b=0.0,
            kl_divergence_mean=0.0, flagged=False,
        )
