"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PrioritizedCveRow, SecurityAsset, VulnerabilityOverview } from "@/types/vulnerability";

function severityBadge(severity: PrioritizedCveRow["severity"]): string {
  switch (severity) {
    case "critical":
      return "bg-red-50 text-red-800 border-red-200";
    case "high":
      return "bg-orange-50 text-orange-900 border-orange-200";
    case "medium":
      return "bg-amber-50 text-amber-900 border-amber-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function VulnerabilitiesContent() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight")?.trim() ?? "";

  const [data, setData] = useState<VulnerabilityOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/security/vulnerabilities", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((await res.json()) as VulnerabilityOverview);
    } catch {
      setError("Could not load vulnerability data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function publishTopAlerts() {
    setPublishBusy(true);
    setPublishMsg(null);
    try {
      const res = await fetch("/api/security/vulnerabilities/publish-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 3 }),
      });
      const json = (await res.json()) as { created?: number; error?: string };
      if (!res.ok) {
        setPublishMsg(json.error ?? "Publish failed");
        return;
      }
      setPublishMsg(`Added ${json.created ?? 0} alert(s) to Command. Open Security Command to view.`);
    } catch {
      setPublishMsg("Network error while publishing.");
    } finally {
      setPublishBusy(false);
    }
  }

  const rows = data?.prioritized ?? [];
  const assets = data?.assets ?? [];

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
          <span className="text-[13px] text-[#9ca3af]">Vulnerabilities</span>
        </div>
        <Link
          href="/command"
          className="text-[12px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors border border-[#e8e4de] px-3 py-1.5 rounded-lg shrink-0"
        >
          Back to Command
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="font-mono text-[10px] text-indigo-600 uppercase tracking-widest">
              CVE · Asset context
            </span>
          </div>
          <h1
            className="text-3xl text-[#0a0a0a] leading-snug mb-2"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            Intelligent vulnerability prioritization
          </h1>
          <p className="text-[14px] text-[#6b7280] max-w-3xl leading-relaxed">
            Demo uses <strong className="font-medium text-[#374151]">static sample assets and CVEs</strong> in{" "}
            <code className="text-[12px] bg-[#f0ede8] px-1 rounded">data/security-assets.json</code> and{" "}
            <code className="text-[12px] bg-[#f0ede8] px-1 rounded">data/cve-sample.json</code>. Scores combine
            CVSS with asset criticality and internet exposure — no live network scanning.
          </p>
        </div>

        <div className="rounded-xl border border-[#e8e4de] bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[13px] text-[#374151] font-medium">Push top findings to Command</p>
            <p className="text-[12px] text-[#9ca3af] mt-1">
              Creates up to 3 alerts (needs <code className="text-[11px]">MONGODB_URI</code>). Safe to click more than once for demos.
            </p>
            {publishMsg && (
              <p className={`text-[12px] mt-2 ${publishMsg.includes("fail") || publishMsg.includes("error") ? "text-red-600" : "text-emerald-700"}`}>
                {publishMsg}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={publishBusy || loading}
            onClick={() => void publishTopAlerts()}
            className="shrink-0 px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {publishBusy ? "Publishing…" : "Publish top 3 to alerts"}
          </button>
        </div>

        <section>
          <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-[0.25em] mb-4">Asset inventory</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading && <p className="text-sm text-[#6b7280] col-span-full">Loading…</p>}
            {!loading &&
              assets.map((a: SecurityAsset) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-[#e8e4de] bg-white p-4 shadow-sm"
                >
                  <p className="text-[14px] font-medium text-[#0a0a0a]">{a.name}</p>
                  <p className="text-[11px] font-mono text-[#9ca3af] mt-0.5">{a.id}</p>
                  <p className="text-[12px] text-[#6b7280] mt-2">{a.role}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        a.internetExposed
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {a.internetExposed ? "Internet-facing" : "Internal"}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border bg-indigo-50 text-indigo-800 border-indigo-100">
                      {a.criticality} criticality
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section>
          <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-[0.25em] mb-4">
            Prioritized CVE queue
          </p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#e8e4de] bg-[#fafaf8]">
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#9ca3af]">
                      Rank
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#9ca3af]">
                      CVE
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#9ca3af]">
                      Score
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#9ca3af]">
                      Severity
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] min-w-[200px]">
                      Why prioritized
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#9ca3af]">
                      Assets
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#6b7280]">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    rows.map((row) => {
                      const isHi = highlight === row.cveId;
                      return (
                        <tr
                          key={row.cveId}
                          className={`border-b border-[#e8e4de] last:border-0 ${isHi ? "bg-indigo-50/80 ring-2 ring-inset ring-indigo-200" : "hover:bg-[#fafaf8]"}`}
                        >
                          <td className="px-4 py-3 tabular-nums text-[#6b7280]">{row.rank}</td>
                          <td className="px-4 py-3">
                            <p className="font-mono text-[12px] text-indigo-700">{row.cveId}</p>
                            <p className="text-[12px] text-[#374151] mt-1 max-w-xs">{row.title}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold tabular-nums text-[#0a0a0a]">{row.score}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${severityBadge(row.severity)}`}
                            >
                              {row.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[#6b7280] max-w-md">
                            <ul className="list-disc pl-4 space-y-1">
                              {row.reasons.slice(0, 3).map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[#6b7280]">
                            {row.affectedAssets.map((a) => a.name).join(", ")}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function VulnerabilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center text-[#6b7280] text-sm">
          Loading…
        </div>
      }
    >
      <VulnerabilitiesContent />
    </Suspense>
  );
}
