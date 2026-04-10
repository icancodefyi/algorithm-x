"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildVulnerabilityIncidentNarrative } from "@/lib/incident-report-bundles";
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

  const [vulnTopN, setVulnTopN] = useState(3);
  const [vulnReportTitle, setVulnReportTitle] = useState("");
  const [vulnAdditional, setVulnAdditional] = useState("");
  const [vulnPlatform, setVulnPlatform] = useState("");
  const [vulnRelatedCase, setVulnRelatedCase] = useState("");
  const [vulnContactEmail, setVulnContactEmail] = useState("");
  const [vulnConsent, setVulnConsent] = useState(false);
  const [vulnReportBusy, setVulnReportBusy] = useState(false);
  const [vulnReportMsg, setVulnReportMsg] = useState<string | null>(null);
  const [vulnReportSuccess, setVulnReportSuccess] = useState<{
    complaintRef: string;
    nextSteps: string[];
  } | null>(null);

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

  const vulnEvidencePreview = useMemo(() => {
    if (!data || rows.length === 0) return "";
    return buildVulnerabilityIncidentNarrative({
      assets: data.assets,
      prioritizedRows: rows,
      includeTopN: vulnTopN,
      additionalContext: vulnAdditional.trim() || "(none yet — add below before submitting)",
    });
  }, [data, rows, vulnTopN, vulnAdditional]);

  async function submitVulnerabilityReport() {
    if (!data || rows.length === 0) return;
    if (!vulnConsent) {
      setVulnReportMsg("Confirm consent to submit.");
      return;
    }
    const narrative = buildVulnerabilityIncidentNarrative({
      assets: data.assets,
      prioritizedRows: rows,
      includeTopN: vulnTopN,
      additionalContext: vulnAdditional,
    });
    setVulnReportBusy(true);
    setVulnReportMsg(null);
    setVulnReportSuccess(null);
    try {
      const res = await fetch("/api/security/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType: "vulnerability_exposure",
          title: vulnReportTitle.trim() || `Vulnerability prioritization — top ${vulnTopN} CVE(s)`,
          narrative,
          platformOrChannel: vulnPlatform.trim() || undefined,
          relatedCaseId: vulnRelatedCase.trim() || undefined,
          contactEmail: vulnContactEmail.trim() || undefined,
          consentFollowup: vulnConsent,
        }),
      });
      const json = (await res.json()) as {
        complaintRef?: string;
        nextSteps?: string[];
        error?: string;
      };
      if (!res.ok) {
        setVulnReportMsg(json.error ?? "Submit failed");
        return;
      }
      if (json.complaintRef && json.nextSteps) {
        setVulnReportSuccess({ complaintRef: json.complaintRef, nextSteps: json.nextSteps });
        setVulnAdditional("");
        setVulnReportTitle("");
        setVulnPlatform("");
        setVulnRelatedCase("");
        setVulnContactEmail("");
        setVulnConsent(false);
      }
    } catch {
      setVulnReportMsg("Network error.");
    } finally {
      setVulnReportBusy(false);
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
            CVSS with asset criticality and internet exposure — no live network scanning.{" "}
            <strong className="font-medium text-[#374151]">Review the queue and file a structured report on this same page</strong> (below).
          </p>
        </div>

        <div className="rounded-xl border border-[#e8e4de] bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[13px] text-[#374151] font-medium">Quick: alerts only (no full report)</p>
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

        {!loading && rows.length > 0 && (
          <section className="rounded-xl border border-[#e8e4de] bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <p className="font-mono text-[10px] text-rose-700 uppercase tracking-[0.25em]">
              Act here — structured report
            </p>
            <p className="text-[13px] text-[#6b7280]">
              Bundles the asset inventory and your selected top CVE rows into one narrative, plus any context you add. Creates a reference ID and Command alert.
            </p>

            {vulnReportSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-900">
                <p className="font-mono text-[11px] uppercase tracking-wider mb-1">Saved</p>
                <p>
                  Reference <span className="font-mono font-semibold">{vulnReportSuccess.complaintRef}</span>
                </p>
                <ul className="list-disc pl-5 mt-2 text-[12px] text-[#374151] space-y-1">
                  {vulnReportSuccess.nextSteps.slice(0, 3).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
                  Include top N CVEs in bundle
                </label>
                <select
                  value={vulnTopN}
                  onChange={(e) => setVulnTopN(Number(e.target.value))}
                  className="rounded-xl border border-[#e8e4de] px-3 py-2 text-[13px] bg-white"
                >
                  {[1, 3, 5, 7, 10].map((n) => (
                    <option key={n} value={n}>
                      Top {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest mb-2">
                Evidence bundle (preview)
              </p>
              <pre className="max-h-56 overflow-y-auto rounded-lg border border-[#e8e4de] bg-[#fafaf8] p-3 text-[11px] text-[#4b5563] whitespace-pre-wrap font-mono leading-relaxed">
                {vulnEvidencePreview}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
                  Report title (optional)
                </label>
                <input
                  type="text"
                  value={vulnReportTitle}
                  onChange={(e) => setVulnReportTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e4de] px-3 py-2 text-[13px]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
                  Additional context (patch window, owner, environment)
                </label>
                <textarea
                  value={vulnAdditional}
                  onChange={(e) => setVulnAdditional(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[#e8e4de] px-3 py-2 text-[13px] resize-y"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
                  Team / platform
                </label>
                <input
                  type="text"
                  value={vulnPlatform}
                  onChange={(e) => setVulnPlatform(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e4de] px-3 py-2 text-[13px]"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
                  Related Sniffer case ID
                </label>
                <input
                  type="text"
                  value={vulnRelatedCase}
                  onChange={(e) => setVulnRelatedCase(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e4de] px-3 py-2 text-[13px] font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
                  Contact email (optional)
                </label>
                <input
                  type="email"
                  value={vulnContactEmail}
                  onChange={(e) => setVulnContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e4de] px-3 py-2 text-[13px]"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={vulnConsent}
                onChange={(e) => setVulnConsent(e.target.checked)}
                className="mt-1 rounded border-[#e8e4de]"
              />
              <span className="text-[12px] text-[#6b7280]">
                I consent to storing this report with the evidence bundle for incident handling.
              </span>
            </label>

            {vulnReportMsg && (
              <p className={`text-[13px] ${vulnReportMsg.includes("Mongo") || vulnReportMsg.includes("fail") ? "text-red-600" : "text-amber-700"}`}>
                {vulnReportMsg}
              </p>
            )}

            <button
              type="button"
              disabled={vulnReportBusy || !vulnConsent}
              onClick={() => void submitVulnerabilityReport()}
              className="px-6 py-2.5 rounded-full bg-rose-600 text-white text-[13px] font-medium hover:bg-rose-700 disabled:opacity-40 transition-colors"
            >
              {vulnReportBusy ? "Submitting…" : "Submit structured report"}
            </button>
          </section>
        )}

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
