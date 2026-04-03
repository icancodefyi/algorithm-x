"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlatformDistribution } from "@/components/dashboard/PlatformDistribution";
import { ThreatMeter } from "@/components/dashboard/ThreatMeter";

interface SavedCase {
  caseId: string;
  domain: string | null;
  caseRef: string | null;
  savedAt: string;
}

interface BreakdownItem {
  name: string;
  count: number;
  pct: number;
}

interface DashboardOverview {
  totals: {
    totalCases: number;
    savedCases: number;
    totalEvents: number;
    caseCreated: number;
    caseSaved: number;
    reportViewed: number;
    deepfakeRate: number;
    casesWithLifecycleEvidence: number;
    evidenceCoveragePct: number;
    updatedAt: string | null;
  };
  breakdown: {
    status: BreakdownItem[];
    platforms: BreakdownItem[];
    issueTypes: BreakdownItem[];
    lifecycle: BreakdownItem[];
  };
  recentCases: Array<{
    caseId: string;
    caseRef: string;
    status: string;
    platform: string;
    issueType: string;
    pipelineType: string;
    createdAt: string | null;
    lifecycleStage: "removed" | "escalated" | "rejected" | "none";
    lifecycleEventType: string | null;
    lifecycleAt: string | null;
    evidenceState: "auditable" | "unverified";
  }>;
  recentEvents: Array<{
    eventType: string;
    caseId: string;
    platform: string;
    issueType: string;
    createdAt: string | null;
  }>;
}

function formatDateTime(input: string | null): string {
  if (!input) return "Unknown";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: string): string {
  const v = status.toLowerCase();
  if (v === "confirmed") return "bg-red-50 text-red-700 border-red-200";
  if (v === "resolved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function lifecycleTone(stage: "removed" | "escalated" | "rejected" | "none"): string {
  if (stage === "removed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (stage === "escalated") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (stage === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function lifecycleLabel(stage: "removed" | "escalated" | "rejected" | "none"): string {
  if (stage === "removed") return "Removed";
  if (stage === "escalated") return "Escalated";
  if (stage === "rejected") return "Rejected";
  return "No Audit Trail";
}

function eventLabel(eventType: string): string {
  if (eventType === "case_created") return "Case Created";
  if (eventType === "case_saved") return "Case Saved";
  if (eventType === "report_viewed") return "Report Viewed";
  return eventType;
}

export default function DashboardPage() {
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    fetch("/api/user/cases")
      .then((r) => r.json())
      .then((d: { cases: SavedCase[] }) => {
        setCases(d.cases ?? []);
        setLoadingCases(false);
      })
      .catch(() => setLoadingCases(false));

    fetch("/api/dashboard/overview")
      .then((r) => r.json())
      .then((d: DashboardOverview) => {
        setOverview(d);
        setLoadingOverview(false);
      })
      .catch(() => setLoadingOverview(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="border-b border-[#e8e4de] px-6 py-4 flex items-center gap-3 bg-white sticky top-0 z-10">
        <Link
          href="/"
          className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity"
        >
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <span className="text-[13px] text-[#9ca3af]">Case Intelligence</span>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            className="text-[12px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors border border-[#e8e4de] px-3 py-1.5 rounded-lg"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-2xl border border-[#e8e4de] bg-white mb-8">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-linear-to-br from-orange-100 to-red-100 opacity-60" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-linear-to-br from-indigo-100 to-sky-100 opacity-60" />
          <div className="relative px-6 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest mb-3">Dashboard</p>
              <h1 className="text-[28px] sm:text-[34px] leading-tight font-semibold text-[#0a0a0a] tracking-tight">
                Investigation Control Center
              </h1>
              <p className="text-[13px] text-[#6b7280] mt-2 max-w-2xl">
                Live telemetry from case database, claim events, and your saved report portfolio.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 min-w-55">
              <MetricTile
                label="Total Cases"
                value={loadingOverview ? "..." : String(overview?.totals.totalCases ?? 0)}
              />
              <MetricTile
                label="Saved Cases"
                value={loadingOverview ? "..." : String(overview?.totals.savedCases ?? 0)}
              />
              <MetricTile
                label="Events"
                value={loadingOverview ? "..." : String(overview?.totals.totalEvents ?? 0)}
              />
              <MetricTile
                label="Evidence Coverage"
                value={loadingOverview ? "..." : `${overview?.totals.evidenceCoveragePct ?? 0}%`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-5">
          <div className="xl:col-span-3">
            <ThreatMeter
              score={overview?.totals.deepfakeRate ?? 0}
              aiDetections={overview?.totals.caseCreated ?? 0}
              tamperSignals={overview?.totals.caseSaved ?? 0}
              registryHits={overview?.totals.reportViewed ?? 0}
            />
          </div>
          <div className="xl:col-span-2 rounded-xl border border-[#e8e4de] bg-white p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Case Status Breakdown</p>
              <span className="text-[10px] font-mono text-[#c4bdb5]">Live DB</span>
            </div>
            <div className="space-y-3.5">
              {(overview?.breakdown.status ?? []).map((row) => (
                <div key={row.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[12px] text-[#374151] capitalize">{row.name}</div>
                    <div className="font-mono text-[11px] text-[#6b7280] tabular-nums">{row.count} ({row.pct}%)</div>
                  </div>
                  <div className="h-2 rounded-full bg-[#f5f3f0] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-linear-to-r from-[#f97316] to-[#ef4444]"
                      style={{ width: `${Math.max(4, row.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
              {!loadingOverview && (overview?.breakdown.status ?? []).length === 0 && (
                <p className="text-[12px] text-[#9ca3af]">No status data found in cases collection.</p>
              )}
              {loadingOverview && <p className="text-[12px] text-[#9ca3af]">Loading status metrics...</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 mt-4 sm:mt-5">
          <div className="lg:col-span-3">
            <PlatformDistribution
              items={(overview?.breakdown.platforms ?? []).map((item) => ({
                name: item.name,
                cases: item.count,
                pct: item.pct,
              }))}
              totalLabel={loadingOverview ? "Loading totals..." : `${overview?.totals.totalCases ?? 0} total cases analysed`}
            />
          </div>
          <div className="lg:col-span-2 rounded-xl border border-[#e8e4de] bg-white p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Issue Type Signals</p>
              <span className="text-[10px] font-mono text-[#c4bdb5]">Top Categories</span>
            </div>
            <div className="space-y-2.5">
              {(overview?.breakdown.issueTypes ?? []).map((row, idx) => (
                <div key={row.name} className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-[#c4bdb5] w-4 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="text-[12px] text-[#374151] truncate flex-1">{row.name}</span>
                  <span className="font-mono text-[11px] text-[#6b7280] tabular-nums">{row.count}</span>
                </div>
              ))}
              {!loadingOverview && (overview?.breakdown.issueTypes ?? []).length === 0 && (
                <p className="text-[12px] text-[#9ca3af]">No issue_type data available.</p>
              )}
              {loadingOverview && <p className="text-[12px] text-[#9ca3af]">Loading issue type metrics...</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 mt-4 sm:mt-5">
          <section className="lg:col-span-3 rounded-xl border border-[#e8e4de] bg-white p-5">
            <div className="mb-4 rounded-lg border border-[#f0ede8] bg-[#fcfcfb] px-3 py-2.5">
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                Declared case status is informational only. Legal claims like escalation or removal are shown only when matching lifecycle events exist in claim_events.
              </p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Recent Cases from Database</p>
              <Link
                href="/start"
                className="text-[12px] font-medium text-[#0a0a0a] border border-[#e8e4de] px-3 py-1.5 rounded-lg hover:bg-[#fafaf8]"
              >
                New Investigation
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-155">
                <thead>
                  <tr className="text-left border-b border-[#f0ede8]">
                    <th className="py-2 text-[10px] font-mono uppercase tracking-widest text-[#b0a89e]">Case</th>
                    <th className="py-2 text-[10px] font-mono uppercase tracking-widest text-[#b0a89e]">Declared</th>
                    <th className="py-2 text-[10px] font-mono uppercase tracking-widest text-[#b0a89e]">Audit Evidence</th>
                    <th className="py-2 text-[10px] font-mono uppercase tracking-widest text-[#b0a89e]">Platform</th>
                    <th className="py-2 text-[10px] font-mono uppercase tracking-widest text-[#b0a89e]">Issue</th>
                    <th className="py-2 text-[10px] font-mono uppercase tracking-widest text-[#b0a89e]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(overview?.recentCases ?? []).map((row) => (
                    <tr key={row.caseId} className="border-b border-[#f8f5f2] last:border-0">
                      <td className="py-3 pr-3">
                        <Link href={`/report/${row.caseId}`} className="text-[12px] font-mono text-[#374151] hover:text-[#0a0a0a]">
                          {row.caseRef}
                        </Link>
                        <div className="text-[11px] text-[#9ca3af] mt-0.5">{row.pipelineType}</div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${statusTone(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${lifecycleTone(row.lifecycleStage)}`}>
                          {lifecycleLabel(row.lifecycleStage)}
                        </span>
                        {row.lifecycleAt && (
                          <div className="text-[10px] text-[#9ca3af] mt-1">{formatDateTime(row.lifecycleAt)}</div>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-[12px] text-[#374151]">{row.platform}</td>
                      <td className="py-3 pr-3 text-[12px] text-[#374151]">{row.issueType}</td>
                      <td className="py-3 text-[11px] text-[#9ca3af]">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingOverview && (overview?.recentCases ?? []).length === 0 && (
              <p className="text-[12px] text-[#9ca3af] mt-3">No case rows available in the cases collection yet.</p>
            )}
          </section>

          <section className="lg:col-span-2 rounded-xl border border-[#e8e4de] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Claim Activity Stream</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#9ca3af]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="max-h-90 overflow-y-auto space-y-2 pr-1">
              {(overview?.recentEvents ?? []).map((event, idx) => (
                <div key={`${event.caseId}-${event.createdAt}-${idx}`} className="border border-[#f0ede8] rounded-lg p-2.5 bg-[#fcfcfb]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#374151]">{eventLabel(event.eventType)}</span>
                    <span className="text-[10px] text-[#9ca3af]">{formatDateTime(event.createdAt)}</span>
                  </div>
                  <div className="text-[10.5px] text-[#9ca3af] mt-1 font-mono">{event.caseId}</div>
                  <div className="text-[11px] text-[#6b7280] mt-1">{event.platform} · {event.issueType}</div>
                </div>
              ))}
              {!loadingOverview && (overview?.recentEvents ?? []).length === 0 && (
                <p className="text-[12px] text-[#9ca3af]">No claim event activity recorded yet.</p>
              )}
              {loadingOverview && <p className="text-[12px] text-[#9ca3af]">Loading event stream...</p>}
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-[#e8e4de] bg-white p-5 mt-4 sm:mt-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">All Cases</p>
              <p className="text-[12px] text-[#6b7280] mt-1">
                {loadingCases
                  ? "Loading saved cases..."
                  : cases.length === 0
                    ? "No saved reports yet."
                    : `${cases.length} investigation report${cases.length === 1 ? "" : "s"} saved.`}
              </p>
            </div>
            <Link
              href="/start"
              className="shrink-0 text-[12.5px] font-medium bg-[#0a0a0a] text-white px-4 py-2 rounded-full hover:bg-[#1a1a1a] transition-colors"
            >
              Start New
            </Link>
          </div>

          {loadingCases ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-15 bg-[#f0ede8] rounded-xl" />
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="border border-dashed border-[#e8e4de] rounded-xl p-10 text-center">
              <p className="text-[13px] font-medium text-[#374151] mb-1.5">No saved cases yet</p>
              <p className="text-[12px] text-[#9ca3af] max-w-xs mx-auto">
                Save any investigation report and it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cases.map((c) => (
                <CaseRow
                  key={c.caseId}
                  savedCase={c}
                  onRemove={(id) => setCases((prev) => prev.filter((x) => x.caseId !== id))}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#e8e4de] bg-white p-5 mt-4 sm:mt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Lifecycle Evidence Summary</p>
            <span className="text-[10px] font-mono text-[#c4bdb5]">Audit Readiness</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(overview?.breakdown.lifecycle ?? []).map((item) => (
              <div key={item.name} className="rounded-lg border border-[#f0ede8] bg-[#fcfcfb] px-3 py-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">{item.name}</p>
                <p className="text-[22px] font-semibold text-[#111827] mt-2 tabular-nums">{item.count}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#9ca3af] mt-3">
            Cases with auditable lifecycle evidence: {overview?.totals.casesWithLifecycleEvidence ?? 0} / {overview?.totals.totalCases ?? 0}
          </p>
        </section>

        <div className="border-t border-[#e8e4de] mt-10 pt-6 flex items-center justify-between">
          <p className="font-mono text-[10px] text-[#c4bdb5]">SNIFFER · IMPIC LABS · 2026</p>
          <Link href="/start" className="text-[12px] text-indigo-600 hover:underline">
            New investigation -&gt;
          </Link>
        </div>
      </main>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#ece8e2] bg-white/80 px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-widest text-[#a8a29e] font-mono">{label}</p>
      <p className="text-[16px] font-semibold text-[#111827] mt-1 leading-none tabular-nums">{value}</p>
    </div>
  );
}

function CaseRow({
  savedCase,
  onRemove,
}: {
  savedCase: SavedCase;
  onRemove: (id: string) => void;
}) {
  const [removing, setRemoving] = useState(false);

  const date = new Date(savedCase.savedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function handleRemove() {
    setRemoving(true);
    await fetch(`/api/user/cases?caseId=${savedCase.caseId}`, { method: "DELETE" });
    onRemove(savedCase.caseId);
  }

  const displayRef =
    savedCase.caseRef ?? `SNF-${savedCase.caseId.slice(0, 8).toUpperCase()}`;

  return (
    <div className="border border-[#e8e4de] rounded-xl bg-white px-4 py-3.5 flex items-center gap-4 group hover:border-[#c4bdb5] transition-colors">
      <div className="w-8 h-8 rounded-lg bg-[#f0ede8] border border-[#e8e4de] flex items-center justify-center shrink-0">
        <svg width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/report/${savedCase.caseId}`} className="block group/link">
          <p className="font-mono text-[11.5px] font-semibold text-[#374151] group-hover/link:text-[#0a0a0a] transition-colors">
            {displayRef}
          </p>
          {savedCase.domain && (
            <p className="text-[11px] text-[#9ca3af] mt-0.5 truncate">{savedCase.domain}</p>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:block font-mono text-[10px] text-[#9ca3af]">{date}</span>
        <Link
          href={`/report/${savedCase.caseId}`}
          className="text-[12px] text-indigo-600 hover:underline"
        >
          View
        </Link>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="text-[12px] text-[#9ca3af] hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
        >
          {removing ? "..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
