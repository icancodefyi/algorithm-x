"use client";

import Link from "next/link";
import { useState } from "react";
import type { SpearPhishingAnalysis } from "@/types/spear-phishing";
import type { SecurityAlertSeverity } from "@/types/security-platform";

type AnalyzeResponse = SpearPhishingAnalysis & {
  analystNote: string | null;
  heuristicScore: number;
  modelScore: number | null;
  llmUsed: boolean;
};

function severityBadge(sev: SecurityAlertSeverity): string {
  switch (sev) {
    case "critical":
      return "bg-red-50 text-red-800 border-red-200";
    case "high":
      return "bg-orange-50 text-orange-900 border-orange-200";
    case "medium":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "low":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
}

function verdictLabel(v: SpearPhishingAnalysis["verdict"]): string {
  if (v === "likely_phishing") return "Likely spear-phishing";
  if (v === "suspicious") return "Suspicious — review";
  return "Likely legitimate (still verify)";
}

export default function SpearPhishingPage() {
  const [emailBody, setEmailBody] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    setPublishMsg(null);
    try {
      const res = await fetch("/api/security/phishing/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailBody, url }),
      });
      const json = (await res.json()) as AnalyzeResponse & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Analysis failed");
        return;
      }
      setResult(json);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function publishAlert() {
    if (!result) return;
    setPublishBusy(true);
    setPublishMsg(null);
    const modelPart =
      result.modelScore !== null ? ` · Groq risk ${result.modelScore}` : "";
    const summary =
      (result.signals.length > 0
        ? result.signals
            .slice(0, 4)
            .map((s) => s.label)
            .join(" · ")
        : "No strong heuristic signals") + ` · Heuristic ${result.heuristicScore}${modelPart}`;
    try {
      const res = await fetch("/api/security/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "spear_phishing",
          severity: result.severity,
          title: `Spear-phishing triage: ${verdictLabel(result.verdict)}`,
          message: `Blended score ${result.score}/100. ${summary}`,
          entityId: `phish-${Date.now()}`,
          href: "/command/phishing",
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setPublishMsg(j.error ?? "Could not create alert (MongoDB required).");
        return;
      }
      setPublishMsg("Alert sent to Command. Open Security Command to view.");
    } catch {
      setPublishMsg("Network error while publishing.");
    } finally {
      setPublishBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="border-b border-[#e8e4de] px-4 sm:px-8 py-4 flex flex-wrap items-center gap-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/"
            className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity"
          >
            Sniffer
          </Link>
          <span className="text-[#d4cfc9]">/</span>
          <Link
            href="/command"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-800"
          >
            Command
          </Link>
          <span className="text-[#d4cfc9]">/</span>
          <span className="text-[13px] text-[#9ca3af]">Spear-phishing</span>
        </div>
        <Link
          href="/command"
          className="text-[12px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors border border-[#e8e4de] px-3 py-1.5 rounded-lg shrink-0"
        >
          Back to Command
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="font-mono text-[10px] text-indigo-600 uppercase tracking-widest">
              Heuristics + Groq LLM
            </span>
          </div>
          <h1
            className="text-3xl text-[#0a0a0a] leading-snug mb-2"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            Spear-phishing triage
          </h1>
          <p className="text-[14px] text-[#6b7280] leading-relaxed">
            Paste suspicious message text and an optional link. With{" "}
            <code className="text-[12px] bg-[#f0ede8] px-1 rounded">GROQ_API_KEY</code>,{" "}
            <strong className="font-medium text-[#374151]">Groq</strong> returns a structured risk score and rationale, blended with{" "}
            <strong className="font-medium text-[#374151]">rule-based signals</strong> (35% / 65%). Without the key, only heuristics run. Not a replacement for enterprise email security.
          </p>
        </div>

        <div className="rounded-xl border border-[#e8e4de] bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              Message body
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={10}
              placeholder="Paste email or DM text…"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-y min-h-[160px]"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              URL (optional)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void analyze()}
              className="px-6 py-2.5 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] disabled:opacity-40 transition-colors"
            >
              {loading ? "Analyzing…" : "Run analysis"}
            </button>
            {result && (
              <button
                type="button"
                disabled={publishBusy}
                onClick={() => void publishAlert()}
                className="px-6 py-2.5 rounded-full border border-[#e8e4de] text-[13px] font-medium text-[#374151] hover:bg-[#fafaf8] disabled:opacity-40 transition-colors"
              >
                {publishBusy ? "Publishing…" : "Add to Command alerts"}
              </button>
            )}
          </div>
          {publishMsg && (
            <p
              className={`text-[13px] ${publishMsg.includes("Mongo") || publishMsg.includes("fail") || publishMsg.includes("error") || publishMsg.includes("Network") ? "text-red-600" : "text-emerald-700"}`}
            >
              {publishMsg}
            </p>
          )}
        </div>

        {result && (
          <div className="rounded-xl border border-[#e8e4de] bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest mb-1">
                  Blended score
                </p>
                <p className="text-4xl font-semibold tabular-nums text-[#0a0a0a]">{result.score}</p>
                <p className="text-[11px] text-[#9ca3af] mt-1">
                  Heuristic {result.heuristicScore}
                  {result.modelScore !== null ? ` · Groq ${result.modelScore} (65% / 35%)` : " · Groq off"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest mb-1">Severity</p>
                <span
                  className={`inline-block text-[10px] font-mono uppercase px-2 py-1 rounded border ${severityBadge(result.severity)}`}
                >
                  {result.severity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest mb-1">Verdict</p>
                <p className="text-[15px] font-medium text-[#0a0a0a]">{verdictLabel(result.verdict)}</p>
                {result.llmUsed && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-mono">Groq analysis applied</p>
                )}
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest mb-2">Signals</p>
              {result.signals.length === 0 ? (
                <p className="text-[13px] text-[#6b7280]">No heuristic hits above threshold.</p>
              ) : (
                <ul className="space-y-2">
                  {result.signals.map((s) => (
                    <li
                      key={s.id}
                      className="flex justify-between gap-3 text-[13px] border border-[#e8e4de] rounded-lg px-3 py-2 bg-[#fafaf8]"
                    >
                      <span className="text-[#374151]">{s.label}</span>
                      <span className="font-mono text-[11px] text-[#9ca3af] shrink-0">+{s.weight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result.analystNote && (
              <div>
                <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest mb-2">
                  Groq analyst rationale
                </p>
                <p className="text-[14px] text-[#4b5563] leading-relaxed whitespace-pre-wrap">{result.analystNote}</p>
              </div>
            )}
            {!result.llmUsed && !result.analystNote && (
              <p className="text-[12px] text-[#9ca3af]">
                Set <code className="text-[11px]">GROQ_API_KEY</code> for LLM risk scoring and rationale (same key as Case Analyst).
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
