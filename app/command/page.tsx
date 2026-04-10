"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { SecurityAlert, SecurityAlertsOverview } from "@/types/security-platform";

const MODULES: Array<{
  id: string;
  title: string;
  description: string;
  href: string;
  ready: boolean;
}> = [
  {
    id: "media",
    title: "Media & deepfake",
    description: "Image authenticity, forensic report, neural verdict.",
    href: "/verify/upload",
    ready: true,
  },
  {
    id: "dashboard",
    title: "Case dashboard",
    description: "Saved cases and investigation metrics.",
    href: "/dashboard",
    ready: true,
  },
  {
    id: "complaint",
    title: "Structured complaint",
    description: "Document scams & incidents with a reference ID and next steps.",
    href: "/command/complaint",
    ready: true,
  },
  {
    id: "phishing",
    title: "Spear-phishing",
    description: "Heuristics + Groq JSON risk score (blended).",
    href: "/command/phishing",
    ready: true,
  },
  {
    id: "malware",
    title: "Malware",
    description: "File / hash analysis (coming next).",
    href: "/command/stub/malware",
    ready: false,
  },
  {
    id: "vulns",
    title: "Vulnerabilities",
    description: "CVE + asset context, explainable prioritization (sample data).",
    href: "/command/vulnerabilities",
    ready: true,
  },
  {
    id: "policy",
    title: "Policy Q&A",
    description: "Natural-language policy queries (coming next).",
    href: "/command/stub/policy",
    ready: false,
  },
  {
    id: "counter",
    title: "Countermeasures",
    description: "Deception / simulation lab (coming next).",
    href: "/command/stub/countermeasures",
    ready: false,
  },
];

function severityStyles(severity: SecurityAlert["severity"]): string {
  switch (severity) {
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function riskLabel(score: number): string {
  if (score >= 80) return "Elevated";
  if (score >= 55) return "Moderate";
  if (score >= 25) return "Watch";
  return "Calm";
}

export default function CommandPage() {
  const [data, setData] = useState<SecurityAlertsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/security/alerts", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as SecurityAlertsOverview;
      setData(json);
    } catch {
      setError("Could not load alerts.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const composite = data?.compositeRisk ?? 0;
  const openCount = data?.openCount ?? 0;
  const alerts = data?.alerts ?? [];

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="border-b border-[#e8e4de] px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity"
          >
            Sniffer
          </Link>
          <span className="text-[#d4cfc9]">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-600">
            Security Command
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-[12px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors border border-[#e8e4de] px-3 py-1.5 rounded-lg bg-white"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="text-[12px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#e8e4de] text-[#374151] hover:bg-[#f5f2ed] bg-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="font-mono text-[10px] text-indigo-600 uppercase tracking-widest">
              Platform overview
            </span>
          </div>
          <h1
            className="text-3xl text-[#0a0a0a] leading-snug"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            Unified risk & alerts
          </h1>
          <p className="text-[14px] text-[#6b7280] mt-2 max-w-2xl">
            Composite posture from all security modules. Each capability emits into the same feed as you ship it.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 rounded-xl border border-[#e8e4de] bg-white p-6 shadow-sm">
            <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-[0.25em] mb-2">
              Composite risk
            </p>
            <p className="text-5xl font-semibold tabular-nums text-[#0a0a0a]">
              {loading ? "—" : composite}
            </p>
            <p className="mt-2 text-sm text-[#6b7280]">{loading ? "Loading…" : riskLabel(composite)}</p>
            <p className="mt-4 text-[11px] text-[#9ca3af] leading-relaxed">
              Heuristic score from open alerts (severity + volume). Baseline when empty.
            </p>
          </div>
          <div className="md:col-span-2 rounded-xl border border-[#e8e4de] bg-white p-6 shadow-sm">
            <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-[0.25em] mb-4">
              Open alerts
            </p>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            {!loading && !error && alerts.length === 0 && (
              <p className="text-sm text-[#6b7280]">
                No alerts yet. Modules will emit here as you ship them.
              </p>
            )}
            {!loading && alerts.length > 0 && (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {alerts.map((a) => (
                  <li
                    key={a.alertId}
                    className="flex flex-wrap items-start gap-2 rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-3 py-2.5"
                  >
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${severityStyles(a.severity)}`}
                    >
                      {a.severity}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#0a0a0a] font-medium">{a.title}</p>
                      {a.message && (
                        <p className="text-[12px] text-[#6b7280] mt-0.5 line-clamp-2">{a.message}</p>
                      )}
                      <p className="text-[10px] font-mono text-[#9ca3af] mt-1">
                        {a.source.replace(/_/g, " ")} · {formatTime(a.createdAt)}
                        {a.entityId ? ` · ${a.entityId}` : ""}
                      </p>
                    </div>
                    {a.href && (
                      <Link
                        href={a.href}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 shrink-0"
                      >
                        Open →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {loading && <p className="text-sm text-[#6b7280]">Loading alerts…</p>}
            <p className="mt-4 text-[11px] text-[#9ca3af]">
              Open items: <span className="text-[#374151] tabular-nums font-medium">{openCount}</span>
            </p>
          </div>
        </section>

        <section>
          <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-[0.25em] mb-4">
            Capability modules
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES.map((m) => (
              <Link
                key={m.id}
                href={m.href}
                className="group rounded-xl border border-[#e8e4de] bg-white p-5 shadow-sm hover:border-[#c4bdb5] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="text-[15px] font-medium text-[#0a0a0a]">{m.title}</h2>
                  {m.ready ? (
                    <span className="text-[9px] font-mono uppercase text-emerald-600">Live</span>
                  ) : (
                    <span className="text-[9px] font-mono uppercase text-[#9ca3af]">Soon</span>
                  )}
                </div>
                <p className="text-[12px] text-[#6b7280] leading-relaxed">{m.description}</p>
                <span className="mt-3 inline-block text-[11px] font-mono text-indigo-600 group-hover:text-indigo-800">
                  Go →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
