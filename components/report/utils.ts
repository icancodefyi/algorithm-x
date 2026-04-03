import type { AnalysisResult } from "./types";

export function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-IN", { dateStyle: "long" });
}

export function formatDateTime(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" });
}

export function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function buildCaseRef(caseId: string): string {
  return `SNF-${caseId.slice(0, 4).toUpperCase()}-${caseId.slice(4, 8).toUpperCase()}-${caseId.slice(9, 13).toUpperCase()}`;
}

export const TAKEDOWN_GUIDES: Record<string, string[]> = {
  "mydesi.ltd": [
    "Open the specific page and copy the direct URL",
    "Go to mydesi.ltd support or abuse contact page",
    "Submit non-consensual intimate content complaint with case evidence",
    "Attach Case ID and SHA-256 hash from this report",
  ],
  "fsiblog.pro": [
    "Copy the exact content URL",
    "Use fsiblog.pro abuse or takedown contact channel",
    "Select non-consensual or privacy violation category",
    "Include Case ID, hash evidence, and request cache removal",
  ],
  "viralkand.com": [
    "Capture page evidence and copy direct link",
    "Open viralkand.com DMCA or abuse reporting form",
    "Flag as non-consensual intimate content",
    "Attach forensic report reference and hash",
  ],
  Instagram: [
    "Tap \u00b7\u00b7\u00b7 (three dots) on the post",
    'Select "Report" \u2192 "It\'s inappropriate"',
    'Choose "Involves someone I know" or "Nudity or sexual activity"',
    "Submit \u2014 attach this report\u2019s Case ID as additional evidence",
  ],
  "Twitter / X": [
    "Click \u00b7\u00b7\u00b7 on the tweet",
    'Select "Report Tweet" \u2192 "It\'s abusive or harmful"',
    'Choose "Targeted harassment" or "Impersonation"',
    "Follow prompts \u2014 reference the SHA-256 hash in your report",
  ],
  Telegram: [
    "Open the message or channel",
    "Tap and hold the message \u2192 Forward \u2192 Report",
    "Select the appropriate abuse category",
    "Include Case ID and file hash as documentary evidence",
  ],
  WhatsApp: [
    "Open the chat",
    "Tap the contact name \u2192 More options \u2192 Block \u2192 Report",
    "Details are forwarded to WhatsApp Trust & Safety",
    "Screenshot this report and include the file hash as evidence",
  ],
  Facebook: [
    "Click \u00b7\u00b7\u00b7 on the post",
    'Select "Find support or report post"',
    'Choose "Nudity" or "Harassment" as appropriate',
    "Follow the full reporting flow \u2014 attach Evidence Report PDF",
  ],
  Reddit: [
    "Click \u00b7\u00b7\u00b7 on the post or comment",
    'Select "Report" \u2192 "Involves non-consensual intimate media"',
    "Reddit will escalate to their Safety team automatically",
    "Include your Sniffer Case ID in any follow-up correspondence",
  ],
  TikTok: [
    "Long-press the video and tap the flag icon",
    'Select "Report" \u2192 "Nudity or sexual activity"',
    "Choose the most relevant sub-category for your case",
    "Attach Case ID and forensic hash as supporting evidence",
  ],
  Snapchat: [
    "Press and hold the Snap or Story",
    'Tap "Report Snap" and select the appropriate reason',
    'Choose "Non-consensual intimate image" if available',
    "You can also report at snapchat.com/safety \u2014 include Case ID",
  ],
  Discord: [
    "Right-click the message and select 'Report Message'",
    "Choose the abuse category that best fits your case",
    "For server-level abuse, use discord.com/safety/360044103771-discord-safety",
    "Include your Sniffer Case ID and file hash in the report",
  ],
  YouTube: [
    "Click the three-dot menu below the video",
    'Select "Report" \u2192 "Sexual content" or "Harassment"',
    "Submit the report \u2014 YouTube Trust & Safety reviews within 24 hours",
    "For urgent cases email legal@youtube.com with your Case ID attached",
  ],
  Other: [
    "Screenshot the content page with the URL clearly visible",
    "Locate the platform\u2019s Help Centre \u2192 Safety \u2192 Report Content",
    "Submit a report selecting the most relevant abuse category",
    "Include your Sniffer Case ID and SHA-256 hash as supporting evidence",
  ],
};

export interface SignalRow {
  label: string;
  value: string;
  note: string;
  flagged: boolean;
}

export function buildFinalRiskScore(analysis: AnalysisResult): number {
  const ai = analysis.ai_detection;
  const hasNeuralModel =
    ai != null && ai.model_probability != null && !ai.model_error;
  if (hasNeuralModel) {
    return Math.round(Math.min(Math.max(ai.ai_probability, 0), 1) * 100);
  }
  const manipulationProb = Math.min(
    Math.max(analysis.manipulation_probability ?? (100 - analysis.authenticity_score) / 100, 0),
    1,
  );
  return Math.round(manipulationProb * 100);
}

export function buildSignalRows(analysis: AnalysisResult): SignalRow[] {
  // Use rich per-algorithm signals from the full pipeline when available
  if (analysis.algorithm_signals && analysis.algorithm_signals.length > 0) {
    return analysis.algorithm_signals
      // Strip the AI model row — it is shown as a dedicated card, not a table row
      .filter((sig) => !sig.name.startsWith("AI Generation Detection"))
      // Hide ELA in no-reference mode to avoid overemphasizing a single-image artefact
      .filter((sig) => analysis.reference_based || !sig.name.includes("Error Level Analysis"))
      .map((sig) => ({
        label: sig.name,
        value: sig.value,
        note: `Weight: ${Math.round(sig.weight * 100)}%`,
        flagged: sig.flagged,
      }));
  }

  // Fallback: legacy derived-from-score signals (backward compat)
  const signals = analysis.signals;
  return [
    {
      label: "C2PA / Content Credentials",
      value:
        analysis.c2pa_status === "verified"
          ? "Verified"
          : analysis.c2pa_status === "not_present"
          ? "Not present"
          : "Invalid",
      note:
        analysis.c2pa_status === "not_present"
          ? "No provenance certificate embedded"
          : analysis.c2pa_status === "verified"
          ? "Certificate valid and trusted"
          : "Certificate present but integrity check failed",
      flagged: analysis.c2pa_status !== "verified",
    },
    {
      label: "EXIF Metadata Integrity",
      value: analysis.metadata_integrity === "ok" ? "Clean" : "Anomalies detected",
      note:
        analysis.metadata_integrity === "ok"
          ? "No editing software traces"
          : "Metadata shows signs of post-processing",
      flagged: analysis.metadata_integrity !== "ok",
    },
    {
      label: "Deepfake / Classifier Score",
      value: `${Math.round(analysis.manipulation_probability * 100)}% manipulation confidence`,
      note: `Raw score: ${analysis.manipulation_probability.toFixed(3)}`,
      flagged: analysis.manipulation_probability > 0.5,
    },
    {
      label: "Frequency Domain Analysis",
      value: signals?.frequency_anomalies ? "Anomalies detected" : "Clean",
      note: "FFT / DCT spectral pattern check",
      flagged: Boolean(signals?.frequency_anomalies),
    },
    {
      label: "Reference-Based Comparison",
      value: signals?.reference_based ? "Reference image provided" : "No reference uploaded",
      note: signals?.reference_based
        ? "Cross-image structural comparison performed"
        : "Single-image analysis mode only",
      flagged: false,
    },
    {
      label: "Combined Authenticity Signal",
      value: `${analysis.authenticity_score} / 100`,
      note: analysis.risk_level,
      flagged: analysis.authenticity_score < 50,
    },
  ];
}

export function buildVerdict(analysis: AnalysisResult): string {
  if (analysis.forensic_certainty === "AI-Generated (C2PA Verified)") return "AI GENERATED";
  const riskScore = buildFinalRiskScore(analysis);
  if (riskScore >= 85) return "LIKELY MANIPULATED";
  if (riskScore >= 70) return "HIGH SUSPICION";
  if (riskScore >= 50) return "MEDIUM RISK";
  if (riskScore >= 30) return "LOW SUSPICION";
  return "LIKELY AUTHENTIC";
}

export function buildVerdictColor(analysis: AnalysisResult): string {
  const cert = analysis.forensic_certainty ?? "";
  if (cert === "AI-Generated (C2PA Verified)")
    return "text-red-800 bg-red-50 border-red-300";
  const riskScore = buildFinalRiskScore(analysis);
  if (riskScore >= 85) return "text-red-800 bg-red-50 border-red-300";
  if (riskScore >= 70) return "text-orange-700 bg-orange-50 border-orange-200";
  if (riskScore >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  if (riskScore >= 30) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  return "text-green-700 bg-green-50 border-green-200";
}

export function buildModelFirstSummary(analysis: AnalysisResult): string {
  const ai = analysis.ai_detection;
  const hasNeuralModel = ai != null && ai.model_probability != null && !ai.model_error;
  const riskScore = buildFinalRiskScore(analysis);

  if (!hasNeuralModel) return analysis.explanation;

  const modelPct = Math.round((ai?.model_probability ?? 0) * 100);
  const forensicPct = Math.round((ai?.heuristic_probability ?? ai?.ai_probability ?? 0) * 100);
  const fusedPct = Math.round((ai?.ai_probability ?? 0) * 100);

  if (riskScore >= 85) {
    return `Neural deepfake detection produced a high-confidence manipulation signal (${modelPct}%). Supporting forensic artifact checks produced ${forensicPct}% AI probability. The combined model-first fusion score is ${fusedPct}%, indicating a high likelihood that this image is AI-generated or manipulated.`;
  }

  if (riskScore >= 70) {
    return `Neural deepfake detection returned a strong manipulation signal (${modelPct}%). Supporting forensic artifact checks produced ${forensicPct}% AI probability. The combined model-first fusion score is ${fusedPct}%, indicating elevated manipulation risk and recommending manual review.`;
  }

  if (riskScore >= 50) {
    return `Neural deepfake detection returned a moderate signal (${modelPct}%), while forensic artifact checks produced ${forensicPct}% AI probability. The combined model-first fusion score is ${fusedPct}%, indicating medium risk. This is a review-required result, not definitive proof on its own.`;
  }

  if (riskScore >= 30) {
    return `Neural deepfake detection returned a weak signal (${modelPct}%), with forensic artifact checks at ${forensicPct}%. The combined model-first fusion score is ${fusedPct}%, indicating low suspicion.`;
  }

  return `Neural deepfake detection returned a low manipulation signal (${modelPct}%) and forensic artifact checks remain low (${forensicPct}%). The combined model-first fusion score is ${fusedPct}%, consistent with likely authentic content.`;
}

export function buildActionPriority(score: number): {
  title: string;
  note: string;
  tone: "critical" | "high" | "review" | "observe" | "low";
} {
  if (score >= 85) {
    return {
      title: "Urgent Action Recommended",
      note: "High manipulation risk. Preserve evidence, initiate takedown, and escalate for legal review.",
      tone: "critical",
    };
  }
  if (score >= 70) {
    return {
      title: "High Priority Review",
      note: "Strong manipulation indicators detected. Begin response workflow and verify source context.",
      tone: "high",
    };
  }
  if (score >= 50) {
    return {
      title: "Manual Review Required",
      note: "Moderate risk. Validate with context and human review before final action.",
      tone: "review",
    };
  }
  if (score >= 30) {
    return {
      title: "Monitor",
      note: "Low suspicion. Keep record and monitor recurrence or distribution.",
      tone: "observe",
    };
  }
  return {
    title: "Low Immediate Risk",
    note: "Current evidence is consistent with likely authentic content.",
    tone: "low",
  };
}

export interface TimelineEntry {
  ts: number;
  event: string;
  detail: string;
}

export function buildTimeline(analysis: AnalysisResult, caseRef: string): TimelineEntry[] {
  const { timestamp: t, file_size, mime_type, file_hash } = analysis;
  const riskScore = buildFinalRiskScore(analysis);
  return [
    { ts: t - 125, event: "Case created", detail: `Case ${caseRef} opened` },
    {
      ts: t - 90,
      event: "Image uploaded",
      detail: `${(file_size / 1024).toFixed(0)} KB \u00b7 ${mime_type.split("/")[1].toUpperCase()}`,
    },
    {
      ts: t - 50,
      event: "Forensic scan initiated",
      detail: `${analysis.audit?.algorithms_run?.length ?? analysis.algorithm_signals?.length ?? 7}-algorithm analysis pipeline started`,
    },
    {
      ts: t - 12,
      event: "Manipulation signals processed",
      detail: (() => {
        if (riskScore >= 85) return "High-confidence manipulation signal identified by model-first fusion";
        if (riskScore >= 70) return "Strong manipulation indicators detected across analysis layers";
        if (riskScore >= 50) return "Moderate anomalies detected — manual review recommended";
        if (riskScore >= 30) return "Weak anomalies detected in analysis layers";
        return "No significant anomalies found";
      })(),
    },
    {
      ts: t,
      event: "Report generated",
      detail: `SHA-256: ${file_hash.slice(0, 16)}\u2026 \u00b7 pipeline v${
        analysis.audit?.pipeline_version ?? "1.0.0"
      }`,
    },
  ];
}
