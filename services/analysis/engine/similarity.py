"""
SSIM structural similarity + per-pixel absolute difference map.
Reference is resized to match suspicious image dimensions.
Returns (SimilarityResult, diff_array) where diff_array is uint8 (H, W, 3).
"""
import io

import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as ssim

from .models import SimilarityResult


def compute_similarity(
    suspicious_bytes: bytes,
    reference_bytes: bytes,
) -> tuple[SimilarityResult, np.ndarray]:
    susp_img = Image.open(io.BytesIO(suspicious_bytes)).convert("RGB")
    ref_img = Image.open(io.BytesIO(reference_bytes)).convert("RGB")

    # Resize reference to match suspicious (keep suspicious as ground truth)
    ref_img = ref_img.resize(susp_img.size, Image.LANCZOS)

    susp_arr = np.array(susp_img, dtype=np.uint8)
    ref_arr = np.array(ref_img, dtype=np.uint8)

    # SSIM with full map
    ssim_score, _ssim_map = ssim(
        susp_arr, ref_arr,
        channel_axis=2,
        full=True,
        data_range=255,
    )

    # Absolute pixel difference, clipped to uint8
    diff = np.clip(
        np.abs(susp_arr.astype(np.int32) - ref_arr.astype(np.int32)),
        0, 255,
    ).astype(np.uint8)

    pixel_diff_mean = float(diff.mean()) / 255.0

    result = SimilarityResult(
        ssim_score=round(float(ssim_score), 4),
        pixel_diff_mean=round(pixel_diff_mean, 4),
        flagged=ssim_score < 0.85,
    )

    return result, diff
