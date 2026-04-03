"""
C2PA (Coalition for Content Provenance and Authenticity) manifest verification.

Uses the official c2pa-python library (based on the CAI Rust SDK) to:
  1. Parse the JUMBF manifest store embedded in JPEG / PNG / WebP bytes.
  2. Walk every manifest's validation status array for errors.
  3. Return a structured C2paResult with status + issuer + assertion summary.

Status values:
  - "verified"     — manifest present and all signatures valid
  - "invalid"      — manifest present but at least one validation error
  - "not_present"  — no JUMBF data found (most images)
"""
from __future__ import annotations

import io
import json

from .models import C2paResult

try:
    import c2pa as _c2pa_lib
    _C2PA_AVAILABLE = True
except ImportError:
    _C2PA_AVAILABLE = False


def check_c2pa(image_bytes: bytes, mime_type: str) -> C2paResult:
    """Read and verify the C2PA manifest embedded in image_bytes."""
    if not _C2PA_AVAILABLE:
        return C2paResult(
            status="not_present",
            issuer=None,
            generator_tool=None,
            ai_generated=False,
            ai_label=None,
            validation_errors=[],
            assertions=[],
        )

    buf = io.BytesIO(image_bytes)
    try:
        with _c2pa_lib.Reader(mime_type, buf) as reader:
            raw = reader.json()
    except _c2pa_lib.C2paError as e:
        err_str = str(e)
        if "ManifestNotFound" in err_str or "no JUMBF" in err_str.lower():
            return C2paResult(
                status="not_present",
                issuer=None,
                generator_tool=None,
                ai_generated=False,
                ai_label=None,
                validation_errors=[],
                assertions=[],
            )
        # Other error = present but unreadable
        return C2paResult(
            status="invalid",
            issuer=None,
            generator_tool=None,
            ai_generated=False,
            ai_label=None,
            validation_errors=[err_str],
            assertions=[],
        )

    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return C2paResult(
            status="invalid",
            issuer=None,
            generator_tool=None,
            ai_generated=False,
            ai_label=None,
            validation_errors=["Manifest JSON could not be parsed"],
            assertions=[],
        )

    # ── Walk manifests ────────────────────────────────────────────────────────
    manifests: dict = data.get("manifests", {})
    active_label: str | None = data.get("active_manifest")

    # Top-level validation_status (where c2pa-python puts aggregate failures)
    top_vs: list[dict] = data.get("validation_status", [])

    hard_errors: list[str] = []     # crypto failures — image was tampered after signing
    trust_warnings: list[str] = []  # cert not in trusted store — structure is still intact

    for vs in top_vs:
        code = vs.get("code", "")
        explanation = vs.get("explanation", "")
        if not code:
            continue
        if code == "signingCredential.untrusted":
            trust_warnings.append(explanation or code)
        elif "failure" in code.lower() or "invalid" in code.lower():
            hard_errors.append(explanation or code)

    issuer: str | None = None
    issuer_org: str | None = None
    generator_tool: str | None = None
    signing_time: str | None = None
    ai_generated: bool = False
    ai_label_str: str | None = None
    actions_summary: list[str] = []
    assertions_summary: list[str] = []

    for label, manifest in manifests.items():
        # ── 1. Generator tool from claim_generator_info (real schema location) ──
        gen_info_list = manifest.get("claim_generator_info", [])
        if gen_info_list and not generator_tool:
            gen_info = gen_info_list[0]
            generator_tool = gen_info.get("name") or gen_info.get("product")

        # ── 2. Issuer from signature_info direct fields (not cert_chain parsing) ─
        sig_info = manifest.get("signature_info", {})
        if sig_info:
            if label == active_label or not issuer:
                issuer = sig_info.get("common_name") or sig_info.get("issuer")
                issuer_org = sig_info.get("issuer") if sig_info.get("common_name") else None
            if label == active_label and not signing_time:
                signing_time = sig_info.get("time")

        # ── 3. Assertions ─────────────────────────────────────────────────────
        for assertion in manifest.get("assertions", []):
            label_name: str = assertion.get("label", "")
            assertions_summary.append(label_name)
            adict: dict = assertion.get("data", {})

            # AI detection: digitalSourceType trainedAlgorithmicMedia inside actions
            if label_name in ("c2pa.actions", "c2pa.actions.v2"):
                for action in adict.get("actions", []):
                    dst: str = action.get("digitalSourceType", "")
                    desc: str = action.get("description", "")
                    act: str = action.get("action", "")
                    if "trainedAlgorithmicMedia" in dst or "generativeAI" in dst or "aiGeneratedContent" in dst:
                        ai_generated = True
                        if not ai_label_str:
                            ai_label_str = act
                    # Collect human-readable action descriptions
                    if desc:
                        actions_summary.append(desc)
                    elif act:
                        # Fallback: prettify the action code e.g. c2pa.created → Created
                        short = act.split(".")[-1].capitalize()
                        if label == active_label or not actions_summary:
                            actions_summary.append(short)

            # Legacy: explicit ai/training assertion labels (older manifests)
            if ("ai" in label_name.lower() or "training" in label_name.lower()) and not ai_generated:
                ai_generated = True
                ai_label_str = label_name

    # ── Determine overall status ──────────────────────────────────────────────
    if hard_errors:
        status = "invalid"
    elif trust_warnings and not hard_errors:
        # Cert not in trusted CA store but manifest is cryptographically intact
        status = "trust_warning"
    else:
        status = "verified"

    return C2paResult(
        status=status,
        issuer=issuer,
        issuer_org=issuer_org,
        generator_tool=generator_tool,
        signing_time=signing_time,
        ai_generated=ai_generated,
        ai_label=ai_label_str,
        actions_summary=list(dict.fromkeys(actions_summary)),  # deduplicate, preserve order
        validation_errors=hard_errors + trust_warnings,
        assertions=assertions_summary,
    )
