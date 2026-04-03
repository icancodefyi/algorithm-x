from fastapi import APIRouter
from routers.cases import _cases
from routers.analysis import _results

router = APIRouter()


@router.get("/")
def get_dashboard():
    total_cases = len(_cases)
    total_analysed = len(_results)

    # Tamper type distribution from real analysis results
    tamper_counts: dict[str, int] = {}
    severity_counts: dict[str, int] = {}
    c2pa_counts = {"verified": 0, "invalid": 0, "not_present": 0}
    manipulation_confirmed = 0

    for r in _results.values():
        # Verdict / severity
        verdict = r.get("verdict", "")
        if verdict in ("High Suspicion", "Confirmed Manipulation"):
            severity = "high"
            manipulation_confirmed += 1
        elif verdict == "Moderate Suspicion":
            severity = "medium"
        else:
            severity = "low"
        severity_counts[severity] = severity_counts.get(severity, 0) + 1

        # Tamper type from issue_type of the linked case
        case_id = r.get("case_id", "")
        case = _cases.get(case_id, {})
        issue = case.get("issue_type", "Unknown")
        tamper_counts[issue] = tamper_counts.get(issue, 0) + 1

        # C2PA
        c2pa = r.get("c2pa", {})
        c2pa_status = c2pa.get("status", "") if isinstance(c2pa, dict) else ""
        if c2pa_status == "valid":
            c2pa_counts["verified"] += 1
        elif c2pa_status in ("invalid", "tampered"):
            c2pa_counts["invalid"] += 1
        else:
            c2pa_counts["not_present"] += 1

    manipulation_rate = (
        round(manipulation_confirmed / total_analysed, 4) if total_analysed > 0 else 0.0
    )

    return {
        "total_cases": total_cases,
        "total_analysed": total_analysed,
        "manipulation_rate": manipulation_rate,
        "tamper_type_distribution": tamper_counts,
        "severity_distribution": severity_counts,
        "c2pa_credential_presence": c2pa_counts,
    }
