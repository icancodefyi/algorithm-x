from __future__ import annotations

import io
import os
from pathlib import Path
from typing import Any

import requests
from PIL import Image

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    load_dotenv = None  # type: ignore[assignment]

_DEFAULT_MODEL_ID = "prithivMLmods/Deep-Fake-Detector-v2-Model"
_HF_ROUTER_BASE = "https://router.huggingface.co/hf-inference/models"
_ENV_LOADED = False


def _load_env_once() -> None:
    global _ENV_LOADED
    if _ENV_LOADED:
        return

    if load_dotenv is None:
        _ENV_LOADED = True
        return

    this_file = Path(__file__).resolve()
    root_dir = this_file.parents[3]
    candidates = [
        root_dir / "services" / "analysis" / ".env",
        root_dir / ".env",
        root_dir / "apps" / "web" / ".env.local",
    ]
    for env_path in candidates:
        if env_path.exists():
            load_dotenv(env_path, override=False)

    _ENV_LOADED = True


def _normalize_label(label: str) -> str:
    l = label.strip().lower()
    if l in {"deepfake", "fake", "ai", "ai-generated", "ai generated"}:
        return "Deepfake"
    if l in {"real", "realism", "authentic", "original"}:
        return "Realism"
    return label.strip()


def _extract_probabilities(output: list[Any]) -> tuple[float, str]:
    deepfake_prob = 0.0
    top_label = "Unknown"
    top_score = -1.0

    for item in output:
        if isinstance(item, dict):
            raw_label = str(item.get("label", ""))
            score = float(item.get("score", 0.0))
        elif hasattr(item, "label") and hasattr(item, "score"):
            raw_label = str(item.label)
            score = float(item.score)
        else:
            continue

        label = _normalize_label(raw_label)

        if score > top_score:
            top_score = score
            top_label = label

        if label == "Deepfake":
            deepfake_prob = max(deepfake_prob, score)

    if deepfake_prob == 0.0 and top_label == "Realism" and top_score >= 0.0:
        deepfake_prob = max(0.0, min(1.0, 1.0 - top_score))

    return round(max(0.0, min(1.0, deepfake_prob)), 4), top_label


def predict_deepfake_probability(
    image_bytes: bytes,
) -> tuple[float, str, str, str | None]:
    """
    Returns (deepfake_probability, model_name, top_label, error).

    Uses direct requests.post with Content-Type: image/jpeg to avoid
    content-type detection issues in the InferenceClient SDK.
    """
    _load_env_once()

    model_id = os.getenv("DEEPFAKE_MODEL_ID", _DEFAULT_MODEL_ID).strip() or _DEFAULT_MODEL_ID
    token = os.getenv("HF_TOKEN", "")
    api_url = f"{_HF_ROUTER_BASE}/{model_id}"

    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        jpeg_buf = io.BytesIO()
        pil_image.save(jpeg_buf, format="JPEG", quality=95)
        jpeg_bytes = jpeg_buf.getvalue()

        headers = {
            "Content-Type": "image/jpeg",
            "Authorization": f"Bearer {token}",
        }

        response = requests.post(api_url, headers=headers, data=jpeg_bytes, timeout=30)

        if response.status_code != 200:
            return 0.0, model_id, "Unknown", f"HTTP {response.status_code}: {response.text[:200]}"

        payload = response.json()

        if not isinstance(payload, list) or len(payload) == 0:
            return 0.0, model_id, "Unknown", "empty_model_output"

        deepfake_prob, top_label = _extract_probabilities(payload)
        return deepfake_prob, model_id, top_label, None

    except Exception as ex:
        return 0.0, model_id, "Unknown", str(ex)
