"""
AI-generated image detection via signal-based analysis (no neural classifier needed).

Three independent, referenceless signals:
  1. FFT spectral grid fingerprint
       Diffusion models upsample from a latent grid (typically 64×64 or 32×32 px).
       This leaves periodic energy peaks in the 2D power spectrum at spatial
       frequencies corresponding to the latent patch size.
       Real photographs have smooth, 1/f power spectra with no such grid.

  2. PRNU (Photo Response Non-Uniformity) noise floor test
       Every camera sensor has a unique fixed-pattern noise signature embedded
       in its output. AI images have statistically flat, spatially-homogeneous
       residuals — no camera fingerprint. We measure the kurtosis and spatial
       autocorrelation of the Gaussian residual: real photos show spatial
       correlation; AI images show near-white noise with high kurtosis.

  3. Chromatic aberration (CA) absence test
       Real lenses cause R and B channels to spatially diverge at edges
       (lateral CA). AI generators produce perfect per-pixel channel alignment.
       We measure the R-B spatial offset at high-contrast edges; near-zero
       offset is a positive AI indicator.

Combined score → ai_probability [0.0 – 1.0] → flagged if >= 0.55
"""
from __future__ import annotations

import io
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, label as ndlabel
from scipy.stats import kurtosis as sp_kurtosis

from .deepfake_model import predict_deepfake_probability
from .models import AiDetectionResult

# ── Tuning constants ──────────────────────────────────────────────────────────
_FFT_GRID_THRESHOLD = 3.5    # peak/median ratio in power spectrum to flag
_PRNU_KURTOSIS_THRESHOLD = 4.5  # kurtosis above this = flat AI noise
_CA_OFFSET_THRESHOLD = 0.4   # pixels; below this = suspiciously perfect
_AI_FLAG_THRESHOLD = 0.55    # combined probability to flag
_MODEL_WEIGHT = 0.95
_HEURISTIC_WEIGHT = 0.05


def _fft_grid_score(grey_arr: np.ndarray) -> tuple[float, bool]:
    """
    Compute 2D FFT power spectrum. Look for periodic spike patterns
    (repeating peaks) characteristic of latent-space upsampling.
    Returns (peak_ratio, flagged).
    """
    # Centre-crop to power-of-2 for clean FFT
    h, w = grey_arr.shape
    ch, cw = min(h, 512), min(w, 512)
    crop = grey_arr[:ch, :cw].astype(np.float32)

    # Apply Hann window to reduce edge ringing
    hann_h = np.hanning(ch)
    hann_w = np.hanning(cw)
    window = np.outer(hann_h, hann_w)
    windowed = (crop - crop.mean()) * window

    fft = np.fft.fft2(windowed)
    power = np.abs(np.fft.fftshift(fft)) ** 2

    # Exclude DC component (centre pixel)
    cy, cx = ch // 2, cw // 2
    power[cy - 3:cy + 4, cx - 3:cx + 4] = 0

    # Log scale to flatten dynamic range
    log_power = np.log1p(power)

    median_val = float(np.median(log_power[log_power > 0]))
    # Find isolated bright peaks: pixels > 3.5× median arranged periodically
    peak_mask = log_power > (_FFT_GRID_THRESHOLD * median_val)

    # Count distinct connected components — real photos have virtually none
    labeled, n_peaks = ndlabel(peak_mask)
    peak_ratio = float(n_peaks) / max(
        float(np.sum(log_power > 0)) / 1000.0, 1.0
    )

    flagged = n_peaks > 8 and peak_ratio > 0.02
    return round(min(peak_ratio * 10, 1.0), 4), flagged


def _prnu_score(grey_arr: np.ndarray) -> tuple[float, bool]:
    """
    Measure kurtosis of the Gaussian noise residual.
    Real camera noise: spatially correlated, kurtosis typically 3–4.
    AI output: spatially random (near-white), kurtosis may go above 4.5.
    Returns (normalised_kurtosis, flagged).
    """
    arr = grey_arr.astype(np.float32)
    residual = arr - gaussian_filter(arr, sigma=1.5)
    flat = residual.ravel()
    if flat.std() < 1e-6:
        # Perfectly flat image (e.g. solid colour) — no noise to analyse
        return 0.0, False
    kurt = float(sp_kurtosis(flat, fisher=True))  # Fisher: normal=0
    if not (kurt == kurt):  # NaN guard
        kurt = 0.0
    normalised = round(min(abs(kurt) / 10.0, 1.0), 4)
    flagged = kurt > _PRNU_KURTOSIS_THRESHOLD
    return normalised, flagged


def _ca_score(rgb_arr: np.ndarray) -> tuple[float, bool]:
    """
    Measure lateral chromatic aberration: spatial offset between R and B channels
    at high-contrast edges. Near-zero offset → AI indicator.
    Returns (offset_pixels, flagged).
    """
    r = rgb_arr[:, :, 0].astype(np.float32)
    b = rgb_arr[:, :, 2].astype(np.float32)

    # Edge map via gradient magnitude
    def grad_mag(ch: np.ndarray) -> np.ndarray:
        gx = np.gradient(ch, axis=1)
        gy = np.gradient(ch, axis=0)
        return np.hypot(gx, gy)

    r_edges = grad_mag(r)
    b_edges = grad_mag(b)

    # Only strong edges matter
    thresh = float(np.percentile(r_edges, 90))
    mask = r_edges > thresh

    if mask.sum() < 100:
        # Not enough edges to judge
        return 0.5, False

    # Normalised cross-correlation shift estimate
    r_e = r_edges[mask]
    b_e = b_edges[mask]

    # Simple proxy: std of |r_edge - b_edge| at strong edge locations
    diff_std = float(np.std(np.abs(r_e - b_e)))
    # Real photos show std > 0.4; AI shows near-0 (channels match perfectly)
    offset_proxy = round(min(diff_std / 5.0, 1.0), 4)

    flagged = diff_std < _CA_OFFSET_THRESHOLD
    return offset_proxy, flagged


def run_ai_detection(image_bytes: bytes) -> AiDetectionResult:
    """
    Run all three referenceless AI-generation signals and combine them.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Clamp to 1024px — faster, still accurate
        if max(img.size) > 1024:
            img.thumbnail((1024, 1024), Image.LANCZOS)
        rgb_arr = np.array(img, dtype=np.uint8)
        grey_arr = np.array(img.convert("L"), dtype=np.float32)
    except Exception:
        return AiDetectionResult(
            ai_probability=0.0,
            ai_flagged=False,
            fft_grid_score=0.0,
            fft_grid_flagged=False,
            prnu_score=0.0,
            prnu_flagged=False,
            ca_score=0.5,
            ca_flagged=False,
        )

    try:
        fft_score, fft_flag = _fft_grid_score(grey_arr)
    except Exception:
        fft_score, fft_flag = 0.0, False

    try:
        prnu, prnu_flag = _prnu_score(grey_arr)
    except Exception:
        prnu, prnu_flag = 0.0, False

    try:
        ca, ca_flag = _ca_score(rgb_arr)
    except Exception:
        ca, ca_flag = 0.5, False

    # ── Combine: weighted vote ─────────────────────────────────────────────
    # FFT is strongest signal (0.5), PRNU medium (0.3), CA weakest (0.2)
    # Each signal contributes full weight only if flagged.
    heuristic_prob = (
        (fft_score * 0.50 if fft_flag else fft_score * 0.15) +
        (prnu * 0.30 if prnu_flag else prnu * 0.10) +
        ((1.0 - ca) * 0.20 if ca_flag else (1.0 - ca) * 0.05)
    )
    # Guard against NaN from edge cases (uniform images etc.)
    if not (heuristic_prob == heuristic_prob):  # NaN check
        heuristic_prob = 0.0
    heuristic_prob = round(min(max(heuristic_prob, 0.0), 1.0), 4)

    model_prob, model_name, model_label, model_error = predict_deepfake_probability(image_bytes)

    if model_error is None:
        final_prob = round(
            min(max(model_prob * _MODEL_WEIGHT + heuristic_prob * _HEURISTIC_WEIGHT, 0.0), 1.0),
            4,
        )
        source = "hybrid_model_plus_forensics"
    else:
        final_prob = heuristic_prob
        source = "heuristic_fallback"

    return AiDetectionResult(
        ai_probability=final_prob,
        ai_flagged=final_prob >= _AI_FLAG_THRESHOLD,
        fft_grid_score=fft_score,
        fft_grid_flagged=fft_flag,
        prnu_score=prnu,
        prnu_flagged=prnu_flag,
        ca_score=ca,
        ca_flagged=ca_flag,
        model_name=model_name,
        model_label=model_label,
        model_probability=model_prob if model_error is None else None,
        model_error=model_error,
        heuristic_probability=heuristic_prob,
        signal_source=source,
    )
