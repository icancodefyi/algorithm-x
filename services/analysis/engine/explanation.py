"""
Human-readable forensic explanation generator.
Builds a per-signal narrative that references actual measured values.
Designed for institutional reports — factual, non-opinionated language.
"""
from __future__ import annotations


def build_explanation(
    forensic_certainty: str,
    has_reference: bool,
    ssim_score: float,
    hash_votes: dict | None,
    ela_flagged: bool,
    ela_mean: float,
    double_compression: bool,
    metadata_integrity: str,
    c2pa_status: str,
    c2pa_issuer: str | None,
    c2pa_ai_generated: bool,
    c2pa_generator_tool: str | None,
    noise_inconsistent: bool,
    match_rate: float,
    kl_divergence_mean: float,
    tamper_count: int,
    ai_flagged: bool,
    ai_probability: float,
) -> str:
    parts: list[str] = []

    # ── Opening verdict ───────────────────────────────────────────────────────
    if forensic_certainty == "Near Certain Manipulation":
        parts.append(
            "Forensic analysis of this image indicates near-certain manipulation."
        )
    elif forensic_certainty == "Highly Probable Manipulation":
        parts.append(
            "Multiple independent forensic signals converge on a highly probable conclusion of manipulation."
        )
    elif forensic_certainty == "Probable Manipulation":
        parts.append(
            "Several forensic signals suggest probable image manipulation."
        )
    elif forensic_certainty == "Inconclusive":
        parts.append(
            "Forensic analysis produced mixed or borderline signals; a definitive conclusion cannot be drawn."
        )
    elif forensic_certainty in ("Likely Authentic", "Verified Authentic"):
        parts.append(
            "No significant evidence of manipulation was detected. The image shows characteristics consistent with an authentic source."
        )

    # ── Reference-based signals ───────────────────────────────────────────────
    if has_reference:
        if ssim_score < 0.85:
            parts.append(
                f"Structural Similarity Index (SSIM) against the reference image measured {ssim_score:.3f}, "
                f"below the 0.85 authenticity threshold, indicating significant structural divergence."
            )
        else:
            parts.append(
                f"SSIM against the reference image measured {ssim_score:.3f}, within the expected range for an unmodified image."
            )

        if hash_votes:
            consensus = hash_votes.get("consensus", "inconclusive")
            if consensus == "manipulated":
                parts.append(
                    f"Multi-algorithm perceptual hash consensus: all three hash algorithms "
                    f"(pHash \u0394{hash_votes['phash_distance']}, dHash \u0394{hash_votes['dhash_distance']}, "
                    f"aHash \u0394{hash_votes['ahash_distance']}) independently flagged structural modification."
                )
            elif consensus == "inconclusive":
                parts.append(
                    f"Perceptual hash agreement was partial "
                    f"(pHash \u0394{hash_votes['phash_distance']}, dHash \u0394{hash_votes['dhash_distance']}, "
                    f"aHash \u0394{hash_votes['ahash_distance']}); consensus inconclusive."
                )

        if kl_divergence_mean > 0.10:
            parts.append(
                f"Per-channel color histogram KL-divergence of {kl_divergence_mean:.4f} indicates "
                f"significant colour profile mismatch with the reference, consistent with composite splicing."
            )

        if noise_inconsistent:
            parts.append(
                "Gaussian noise texture is inconsistent between the suspicious and reference images, "
                "suggesting pixels from different source material were composited."
            )

        if match_rate < 0.30:
            parts.append(
                f"ORB feature keypoint match rate was {round(match_rate * 100)}\u202f%, "
                f"well below the 30\u202f% structural correspondence threshold."
            )

        if tamper_count > 0:
            regions = "region" if tamper_count == 1 else "regions"
            parts.append(
                f"{tamper_count} distinct tampered {regions} "
                f"{'was' if tamper_count == 1 else 'were'} isolated and are marked in the heatmap overlay."
            )

    # ── Single-image signals (always run) ────────────────────────────────────
    if ela_flagged:
        parts.append(
            f"Error Level Analysis (ELA) mean residual of {ela_mean:.2f} exceeds the 8.0 threshold, "
            f"indicating regions of the image were compressed at a different quality level — "
            f"a characteristic artefact of JPEG splicing."
        )

    if double_compression:
        parts.append(
            "DCT block variance analysis detected double JPEG compression artefacts, "
            "consistent with an image that was edited and re-saved."
        )

    # ── Metadata + provenance ─────────────────────────────────────────────────
    if metadata_integrity == "anomalies_detected":
        parts.append(
            "EXIF metadata contains editing software traces, confirming post-processing was applied."
        )
    elif metadata_integrity == "missing":
        parts.append(
            "EXIF metadata is absent; it may have been stripped to conceal editing history."
        )

    # ── C2PA provenance (real library result) ────────────────────────────────
    if c2pa_status == "verified":
        issuer_str = f" (signed by {c2pa_issuer})" if c2pa_issuer else ""
        tool_str = f" Origin tool: {c2pa_generator_tool}." if c2pa_generator_tool else ""
        ai_str = " The manifest includes an AI-training assertion, indicating this image was generated or processed by AI." if c2pa_ai_generated else ""
        parts.append(
            f"Content Credentials (C2PA) provenance certificate is present and cryptographically verified{issuer_str}.{tool_str}{ai_str}"
        )
    elif c2pa_status == "trust_warning":
        issuer_str = f" signed by {c2pa_issuer}" if c2pa_issuer else ""
        tool_str = f" Origin tool: {c2pa_generator_tool}." if c2pa_generator_tool else ""
        ai_str = " The manifest declares AI-generated content." if c2pa_ai_generated else ""
        parts.append(
            f"Content Credentials (C2PA) manifest is present and structurally valid ({issuer_str}), "
            f"but the signing certificate is not in the C2PA Trust List — this is common for newer or non-CAI-registered issuers.{tool_str}{ai_str}"
        )
    elif c2pa_status == "invalid":
        parts.append(
            "C2PA Content Credentials are present but failed cryptographic verification. "
            "This indicates the image was modified after the provenance certificate was issued."
        )
    else:
        parts.append(
            "No Content Credentials (C2PA) provenance certificate is embedded in this image. "
            "Absence of provenance is treated as a risk signal because origin cannot be cryptographically verified."
        )

    # ── AI generation detection ────────────────────────────────────────────────
    if c2pa_ai_generated and c2pa_status in ("verified", "trust_warning"):
        # Manifest is ground truth — spectral probability is secondary
        spectral_str = (
            f" Spectral analysis independently measured {round(ai_probability * 100)}\u202f% probability."
            if ai_probability > 0.20 else ""
        )
        parts.append(
            f"AI-generated origin is confirmed by the C2PA manifest — the signer cryptographically declared "
            f"this content was created using a trained AI model (\u2018trainedAlgorithmicMedia\u2019).{spectral_str}"
        )
    elif ai_flagged:
        parts.append(
            f"Model-assisted AI-generation analysis indicates a {round(ai_probability * 100)}\u202f% fused probability "
            "that this image was AI-generated. This signal combines a pretrained deepfake classifier "
            "with independent forensic artefact checks (FFT/PRNU/chromatic-aberration consistency)."
        )
    elif ai_probability > 0.30:
        parts.append(
            f"Weak AI-generation signals detected ({round(ai_probability * 100)}\u202f% fused probability); "
            "result is below the flagging threshold but warrants manual review."
        )

    return " ".join(parts)
