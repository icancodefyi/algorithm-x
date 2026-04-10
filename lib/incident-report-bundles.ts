import type { PrioritizedCveRow, SecurityAsset } from "@/types/vulnerability";

export type PhishingResultForBundle = {
  score: number;
  heuristicScore: number;
  modelScore: number | null;
  severity: string;
  verdict: string;
  signals: Array<{ id: string; label: string; weight: number }>;
  analystNote: string | null;
  llmUsed: boolean;
};

/** Single narrative block: original inputs + full analysis output + reporter addendum (for structured complaint). */
export function buildPhishingIncidentNarrative(params: {
  emailBody: string;
  url: string;
  result: PhishingResultForBundle;
  additionalContext: string;
}): string {
  const { emailBody, url, result, additionalContext } = params;
  const lines = [
    "=== SNIFTER COMMAND — SPEAR-PHISHING TRIAGE (EVIDENCE BUNDLE) ===",
    "",
    "--- Original submission ---",
    url.trim() ? `URL: ${url.trim()}` : "URL: (none)",
    "",
    "Message / body:",
    emailBody.trim() || "(empty)",
    "",
    "--- Analysis output ---",
    `Blended score: ${result.score}/100`,
    `Heuristic: ${result.heuristicScore}${result.modelScore !== null ? ` · Model: ${result.modelScore}` : ""}`,
    `Severity: ${result.severity} · Verdict: ${result.verdict}`,
    result.llmUsed ? "LLM: applied" : "LLM: not applied",
    "",
    "Signals:",
    ...(result.signals.length > 0
      ? result.signals.map((s) => ` • ${s.label} (+${s.weight})`)
      : [" • (none above threshold)"]),
    ...(result.analystNote
      ? ["", "--- Groq analyst note ---", result.analystNote]
      : []),
    "",
    "--- Reporter additional context ---",
    additionalContext.trim() || "(none provided)",
  ];
  return lines.join("\n");
}

export function buildVulnerabilityIncidentNarrative(params: {
  assets: SecurityAsset[];
  prioritizedRows: PrioritizedCveRow[];
  includeTopN: number;
  additionalContext: string;
}): string {
  const { assets, prioritizedRows, includeTopN, additionalContext } = params;
  const top = prioritizedRows.slice(0, Math.max(1, Math.min(includeTopN, 20)));

  const assetLines = assets.map(
    (a) =>
      ` • ${a.name} (${a.id}) — ${a.role}; ${a.internetExposed ? "internet-facing" : "internal"}; ${a.criticality} criticality`,
  );

  const cveLines: string[] = [];
  for (const row of top) {
    cveLines.push(
      `--- ${row.cveId} (rank ${row.rank}, score ${row.score}, ${row.severity}) ---`,
      row.title,
      row.summary,
      `Affected: ${row.affectedAssets.map((x) => x.name).join(", ")}`,
      "Why prioritized:",
      ...row.reasons.map((r) => ` • ${r}`),
      "",
    );
  }

  const lines = [
    "=== SNIFTER COMMAND — VULNERABILITY PRIORITIZATION (EVIDENCE BUNDLE) ===",
    "",
    "--- Asset inventory (sample) ---",
    ...assetLines,
    "",
    `--- Top ${top.length} prioritized CVE(s) ---`,
    ...cveLines,
    "--- Reporter additional context ---",
    additionalContext.trim() || "(none provided)",
  ];
  return lines.join("\n");
}
