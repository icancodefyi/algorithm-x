"""
Chain-of-custody audit trail.
The report_hash is a SHA-256 of the core result fields —
any post-hoc modification of the report invalidates the hash.
"""
import hashlib
import json
import time
from typing import Any

PIPELINE_VERSION = "1.1.0"


def build_audit(
    suspicious_sha256: str,
    reference_sha256: str | None,
    algorithms_run: list[str],
    result_core: dict[str, Any],
) -> dict:
    """
    result_core should contain the stable, non-visual fields of AnalysisResult
    (no base64 heatmaps — they are large and implementation-dependent, not
    part of the tamper-evident digest).
    """
    report_body = json.dumps(result_core, sort_keys=True, default=str)
    report_hash = hashlib.sha256(report_body.encode()).hexdigest()

    return {
        "suspicious_sha256": suspicious_sha256,
        "reference_sha256": reference_sha256,
        "pipeline_version": PIPELINE_VERSION,
        "algorithms_run": algorithms_run,
        "analysis_timestamp": round(time.time(), 3),
        "report_hash": report_hash,
    }
