"""
Main analysis pipeline orchestrator.
Calls each engine module in sequence and assembles the full AnalysisResult.
All modules are designed to catch their own exceptions and return safe defaults,
so the pipeline never raises on bad input — it degrades gracefully.
"""
from __future__ import annotations

import hashlib
import time

import numpy as np

from .models import AnalysisResult
from .metadata import extract_metadata
from .hashing import compute_hashes
from .similarity import compute_similarity
from .ela import run_ela
from .dct import run_dct_analysis
from .color_analysis import run_color_analysis
from .noise_analysis import run_noise_analysis
from .keypoints import run_keypoint_matching
from .heatmap import build_heatmap
from .scoring import compute_score
from .explanation import build_explanation
from .audit import build_audit
from .c2pa_check import check_c2pa
from .ai_detection import run_ai_detection


def run_pipeline(
    case_id: str,
    suspicious_bytes: bytes,
    suspicious_mime: str,
    reference_bytes: bytes | None,
) -> AnalysisResult:
    has_ref = reference_bytes is not None
    algos: list[str] = []

    # ── 0. C2PA manifest verification ────────────────────────────────────────────
    algos.append("c2pa_manifest")
    c2pa_result = check_c2pa(suspicious_bytes, suspicious_mime)
    c2pa_status_str = c2pa_result.status  # verified | invalid | not_present

    # ── 0b. AI-generation detection (referenceless) ───────────────────────────
    algos.append("ai_generation_detection")
    ai_detection = run_ai_detection(suspicious_bytes)
    susp_meta = extract_metadata(suspicious_bytes)
    ref_meta = extract_metadata(reference_bytes) if has_ref else None

    metadata_comparison = None
    if has_ref and ref_meta:
        metadata_comparison = {
            "same_camera_model": susp_meta.camera_model == ref_meta.camera_model,
            "creation_date_match": susp_meta.creation_date == ref_meta.creation_date,
            "suspicious_software": susp_meta.software,
            "reference_software": ref_meta.software,
            "gps_present_suspicious": susp_meta.has_gps,
            "gps_present_reference": ref_meta.has_gps,
        }

    # ── 2. Hashing ───────────────────────────────────────────────────────────
    algos.append("sha256_hash")
    suspicious_sha256 = hashlib.sha256(suspicious_bytes).hexdigest()
    reference_sha256: str | None = None
    hash_votes = None

    if has_ref:
        algos.append("perceptual_hash_consensus")
        _susp_hash, ref_hash_obj, hash_votes = compute_hashes(
            suspicious_bytes, reference_bytes  # type: ignore[arg-type]
        )
        reference_sha256 = ref_hash_obj.sha256

    # ── 3. SSIM + pixel diff ─────────────────────────────────────────────────
    similarity = None
    diff_array: np.ndarray | None = None
    if has_ref:
        algos.append("ssim_similarity")
        similarity, diff_array = compute_similarity(
            suspicious_bytes, reference_bytes  # type: ignore[arg-type]
        )

    # ── 4. ELA ───────────────────────────────────────────────────────────────
    algos.append("ela_analysis")
    ela = run_ela(suspicious_bytes)

    # ── 5. DCT ───────────────────────────────────────────────────────────────
    algos.append("dct_block_analysis")
    dct = run_dct_analysis(suspicious_bytes)

    # ── 6. Color histogram (ref required) ────────────────────────────────────
    color_hist = None
    if has_ref:
        algos.append("color_histogram_kl")
        color_hist = run_color_analysis(
            suspicious_bytes, reference_bytes  # type: ignore[arg-type]
        )

    # ── 7. Noise consistency (ref required) ──────────────────────────────────
    noise = None
    if has_ref:
        algos.append("noise_consistency")
        noise = run_noise_analysis(
            suspicious_bytes, reference_bytes  # type: ignore[arg-type]
        )

    # ── 8. ORB keypoints (ref required) ──────────────────────────────────────
    keypoints = None
    if has_ref:
        algos.append("orb_keypoint_matching")
        keypoints = run_keypoint_matching(
            suspicious_bytes, reference_bytes  # type: ignore[arg-type]
        )

    # ── 9. Heatmap + tamper regions (ref + diff required) ────────────────────
    tamper_heatmap: str | None = None
    tamper_regions: list[dict] = []
    if has_ref and diff_array is not None:
        algos.append("heatmap_generation")
        heatmap_b64, region_objs = build_heatmap(diff_array, suspicious_bytes)
        tamper_heatmap = heatmap_b64
        tamper_regions = [r.model_dump() for r in region_objs]

    # ── 10. Weighted score ───────────────────────────────────────────────────
    algos.append("weighted_scoring")

    ssim_score = similarity.ssim_score if similarity else 1.0
    kl_mean = color_hist.kl_divergence_mean if color_hist else 0.0
    ela_mean = ela.ela_mean_residual
    double_comp = dct.double_compression_likely
    noise_incons = noise.noise_inconsistent if noise else False
    match_rate = keypoints.match_rate if keypoints else 1.0
    hash_flagged = hash_votes.flagged if hash_votes else False

    authenticity_score, risk_level, forensic_certainty, manip_prob = compute_score(
        ssim_score=ssim_score,
        hash_votes_flagged=hash_flagged,
        kl_divergence_mean=kl_mean,
        ela_mean_residual=ela_mean,
        double_compression=double_comp,
        noise_inconsistent=noise_incons,
        match_rate=match_rate,
        metadata_integrity=susp_meta.integrity,
        c2pa_status=c2pa_status_str,
        c2pa_ai_generated=c2pa_result.ai_generated,
        ai_flagged=ai_detection.ai_flagged,
        ai_probability=ai_detection.ai_probability,
        has_reference=has_ref,
    )

    # ── 11. Explanation ──────────────────────────────────────────────────────
    algos.append("explanation_generation")
    explanation = build_explanation(
        forensic_certainty=forensic_certainty,
        has_reference=has_ref,
        ssim_score=ssim_score,
        hash_votes=hash_votes.model_dump() if hash_votes else None,
        ela_flagged=ela.ela_flagged,
        ela_mean=ela_mean,
        double_compression=double_comp,
        metadata_integrity=susp_meta.integrity,
        c2pa_status=c2pa_status_str,
        c2pa_issuer=c2pa_result.issuer,
        c2pa_ai_generated=c2pa_result.ai_generated,
        c2pa_generator_tool=c2pa_result.generator_tool,
        noise_inconsistent=noise_incons,
        match_rate=match_rate,
        kl_divergence_mean=kl_mean,
        tamper_count=len(tamper_regions),
        ai_flagged=ai_detection.ai_flagged,
        ai_probability=ai_detection.ai_probability,
    )

    # ── 12. Per-algorithm signal table ───────────────────────────────────────
    algorithm_signals: list[dict] = [
        {
            "name": "Reference Similarity (SSIM, reference-only)",
            "value": f"{ssim_score:.3f}" if has_ref else "N/A — no reference",
            "flagged": similarity.flagged if similarity else False,
            "weight": 0.30,
        },
        {
            "name": "Perceptual Hash Consensus (pHash·dHash·aHash)",
            "value": hash_votes.consensus.title() if hash_votes else "N/A — no reference",
            "flagged": hash_flagged,
            "weight": 0.15,
        },
        {
            "name": "Color Histogram KL-Divergence",
            "value": f"{kl_mean:.4f}" if has_ref else "N/A — no reference",
            "flagged": color_hist.flagged if color_hist else False,
            "weight": 0.15,
        },
        {
            "name": "Error Level Analysis (ELA)",
            "value": f"{ela_mean:.2f} mean residual",
            "flagged": ela.ela_flagged,
            "weight": 0.13,
        },
        {
            "name": "DCT Double-Compression Artefacts",
            "value": f"CV = {dct.blocking_score:.3f}",
            "flagged": double_comp,
            "weight": 0.09,
        },
        {
            "name": "Noise Consistency Analysis",
            "value": f"ratio = {noise.noise_ratio:.3f}" if noise else "N/A — no reference",
            "flagged": noise_incons,
            "weight": 0.10,
        },
        {
            "name": "ORB Feature Keypoint Match Rate",
            "value": f"{round(match_rate * 100)}\u202f%" if has_ref else "N/A — no reference",
            "flagged": keypoints.flagged if keypoints else False,
            "weight": 0.05,
        },        {
            "name": "C2PA Provenance Verification",
            "value": {
                "verified":      "Verified",
                "trust_warning": "Verified (cert unanchored)",
                "invalid":       "Invalid",
                "not_present":   "Not Present (risk signal)",
            }.get(c2pa_status_str, c2pa_status_str.replace("_", " ").title()),
            "flagged": c2pa_status_str in ("invalid", "not_present"),
            "weight": 0.0,  # informational only — no score impact unless invalid
        },
        {
            "name": "AI Generation Detection (HF Model + FFT\u00b7PRNU\u00b7CA)",
            # When C2PA manifest definitively declares AI, model/spectral output is
            # supporting evidence and should not override provenance certainty.
            "value": (
                "AI-Generated - Confirmed by C2PA Manifest"
                if c2pa_result.ai_generated and c2pa_status_str in ("verified", "trust_warning")
                else (
                    f"{round(ai_detection.model_probability * 100)}% model, "
                    f"{round(ai_detection.ai_probability * 100)}% fused"
                    if ai_detection.model_probability is not None
                    else f"{round(ai_detection.ai_probability * 100)}% heuristic"
                )
            ),
            "flagged": ai_detection.ai_flagged or (
                c2pa_result.ai_generated and c2pa_status_str in ("verified", "trust_warning")
            ),
            "weight": 0.08,
        },    ]

    # ── 13. Audit trail ──────────────────────────────────────────────────────
    algos.append("audit_trail")
    result_core = {
        "case_id": case_id,
        "file_hash": suspicious_sha256,
        "file_size": len(suspicious_bytes),
        "mime_type": suspicious_mime,
        "authenticity_score": authenticity_score,
        "forensic_certainty": forensic_certainty,
        "manipulation_probability": manip_prob,
        "c2pa_status": c2pa_status_str,
        "metadata_integrity": susp_meta.integrity,
    }
    audit = build_audit(
        suspicious_sha256=suspicious_sha256,
        reference_sha256=reference_sha256,
        algorithms_run=algos,
        result_core=result_core,
    )

    # ── 14. Assemble full result ──────────────────────────────────────────────
    return AnalysisResult(
        # Core
        case_id=case_id,
        file_hash=suspicious_sha256,
        file_size=len(suspicious_bytes),
        mime_type=suspicious_mime,
        timestamp=time.time(),
        # Verdict
        authenticity_score=authenticity_score,
        risk_level=risk_level,
        forensic_certainty=forensic_certainty,
        manipulation_probability=manip_prob,
        # Classic signals (backward-compat)
        c2pa_status=c2pa_status_str,
        metadata_integrity=susp_meta.integrity,
        explanation=explanation,
        signals={
            "c2pa": c2pa_status_str,
            "metadata_integrity": susp_meta.integrity,
            "frequency_anomalies": double_comp,
            "reference_based": has_ref,
            "ai_generated": ai_detection.ai_flagged,
        },
        # Image properties
        dimensions={"width": susp_meta.width, "height": susp_meta.height},
        metadata_detail={
            "software": susp_meta.software,
            "camera_model": susp_meta.camera_model,
            "has_gps": susp_meta.has_gps,
            "exif_present": susp_meta.exif_present,
            "creation_date": susp_meta.creation_date,
            "software_suspicious": susp_meta.software_suspicious,
        },
        metadata_comparison=metadata_comparison,
        # Reference analysis
        reference_based=has_ref,
        reference_similarity={
            "ssim_score": ssim_score,
            "pixel_diff_mean": similarity.pixel_diff_mean if similarity else None,
        } if has_ref else None,
        hash_votes=hash_votes.model_dump() if hash_votes else None,
        # Per-algorithm
        algorithm_signals=algorithm_signals,
        ela_result={"mean_residual": ela_mean, "flagged": ela.ela_flagged},
        dct_result={"blocking_score": dct.blocking_score, "double_compression_likely": double_comp},
        color_histogram=color_hist.model_dump() if color_hist else None,
        noise_analysis=noise.model_dump() if noise else None,
        keypoints=keypoints.model_dump() if keypoints else None,
        # Visual
        tamper_heatmap=tamper_heatmap,
        ela_heatmap=ela.ela_heatmap,
        tamper_regions=tamper_regions,
        # New signals
        c2pa_result=c2pa_result.model_dump(),
        ai_detection=ai_detection.model_dump(),
        # Chain of custody
        audit=audit,
    )
