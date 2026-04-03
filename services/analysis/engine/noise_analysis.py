"""

Noise consistency analysis using Gaussian residuals.
Different source images have different sensor noise signatures.
Composited images show inconsistent noise texture across regions.
Ratio > 0.5 between the two noise standard deviations is flagged as inconsistent.
"""
import io

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

from .models import NoiseResult

_SIGMA = 1.0
_RATIO_THRESHOLD = 0.5


def run_noise_analysis(suspicious_bytes: bytes, reference_bytes: bytes) -> NoiseResult:
    try:
        susp_img = Image.open(io.BytesIO(suspicious_bytes)).convert("L")
        ref_img = Image.open(io.BytesIO(reference_bytes)).convert("L").resize(
            susp_img.size, Image.LANCZOS
        )

        susp_arr = np.array(susp_img, dtype=np.float32)
        ref_arr = np.array(ref_img, dtype=np.float32)

        susp_noise = susp_arr - gaussian_filter(susp_arr, sigma=_SIGMA)
        ref_noise = ref_arr - gaussian_filter(ref_arr, sigma=_SIGMA)

        susp_std = float(np.std(susp_noise))
        ref_std = float(np.std(ref_noise))

        ratio = abs(susp_std - ref_std) / (ref_std + 1e-8)

        return NoiseResult(
            suspicious_noise_std=round(susp_std, 4),
            reference_noise_std=round(ref_std, 4),
            noise_ratio=round(ratio, 4),
            noise_inconsistent=ratio > _RATIO_THRESHOLD,
        )

    except Exception:
        return NoiseResult(
            suspicious_noise_std=0.0, reference_noise_std=0.0,
            noise_ratio=0.0, noise_inconsistent=False,
        )
