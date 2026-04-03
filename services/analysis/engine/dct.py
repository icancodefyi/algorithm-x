"""
DCT block artifact analysis.
Double-compressed JPEG images show inconsistent variance across 8×8 DCT blocks.
The coefficient of variation (CV) of per-block variances flags this pattern.
A high CV (> 1.5) indicates the image was compressed, edited, and re-compressed.
"""
import io

import numpy as np
from PIL import Image

from .models import DCTResult

_BLOCK = 8
_CV_THRESHOLD = 1.5


def run_dct_analysis(image_bytes: bytes) -> DCTResult:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        arr = np.array(img, dtype=np.float32)
        h, w = arr.shape

        variances: list[float] = []
        for y in range(0, h - _BLOCK + 1, _BLOCK):
            for x in range(0, w - _BLOCK + 1, _BLOCK):
                block = arr[y : y + _BLOCK, x : x + _BLOCK]
                variances.append(float(np.var(block)))

        if not variances:
            return DCTResult(blocking_score=0.0, double_compression_likely=False)

        var_arr = np.array(variances)
        cv = float(np.std(var_arr) / (np.mean(var_arr) + 1e-8))

        return DCTResult(
            blocking_score=round(cv, 4),
            double_compression_likely=cv > _CV_THRESHOLD,
        )

    except Exception:
        return DCTResult(blocking_score=0.0, double_compression_likely=False)
