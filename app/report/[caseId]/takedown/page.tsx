"use client";

import Link from "next/link";
import { useReportWorkflow } from "@/components/report/ReportWorkflowContext";
import { buildCaseRef, buildTimeline, TAKEDOWN_GUIDES } from "@/components/report/utils";
import { TakedownGuidance } from "@/components/report/TakedownGuidance";
import { LeakActionConsole } from "@/components/report/LeakActionConsole";
import { EvidenceMetadata } from "@/components/report/EvidenceMetadata";
import { EvidenceTimeline } from "@/components/report/EvidenceTimeline";
import { AuditTrail } from "@/components/report/AuditTrail";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export default function TakedownStepPage() {
  const { caseId, caseData, analysis, hashCopied, copyHash } = useReportWorkflow();
  const { t } = useTranslation();
  if (!caseData) return null;

  const caseRef = buildCaseRef(caseId);
  const timeline = analysis ? buildTimeline(analysis, caseRef) : [];
  const takedownSteps = TAKEDOWN_GUIDES[caseData.platform_source];

  return (
    <>
      {/* Section intro */}
      <section className="mb-6">
        <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
          <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
            <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.takedownResponse}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[13.5px] text-[#374151] leading-[1.8]">{t.report.takedownDesc}</p>
          </div>
        </div>
      </section>

      {/* Same bulk + per-domain removal flow as NCII leak report (shared demo domains) */}
      <div className="mb-6 overflow-hidden rounded-xl border border-[#e8e4de] bg-white">
        <div className="border-b border-[#e8e4de] px-6 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] mb-1.5">Bulk Takedown</p>
              <h2 className="text-[17px] font-semibold tracking-tight text-[#0a0a0a]">Escalate all platforms at once</h2>
              <p className="mt-1 text-[12.5px] text-[#6b7280] leading-relaxed max-w-lg">
                Generate one case-wide removal packet covering every detected domain. Per-domain actions remain available below.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end sm:shrink-0">
              <Link
                href={`/takedown?caseId=${caseId}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a0a0a] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
              >
                Open Bulk Takedown
              </Link>
              <Link
                href={`/investigate?caseId=${caseId}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-2 text-[12px] font-medium text-[#374151] hover:bg-white transition-colors"
              >
                Review domains
              </Link>
            </div>
          </div>
        </div>
      </div>

      <LeakActionConsole caseId={caseId} />

      {/* Takedown guidance */}
      <TakedownGuidance
        platform={caseData.platform_source}
        steps={takedownSteps}
        caseId={caseId}
        fileHash={analysis?.file_hash}
        caseRef={caseRef}
      />

      {/* Evidence metadata & timeline */}
      {analysis ? (
        <>
          <EvidenceMetadata analysis={analysis} hashCopied={hashCopied} onCopy={copyHash} />
          <EvidenceTimeline entries={timeline} />
          {analysis.audit && <AuditTrail audit={analysis.audit} />}
        </>
      ) : (
        <section className="mb-6">
          <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
            <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.forensicMetadata}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[12.5px] text-[#6b7280] leading-relaxed">
                {t.report.noForensicPayload}{" "}
                <span className="font-mono font-semibold text-[#0a0a0a]">{caseRef}</span>.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Case Sealed ── */}
      <section className="mb-6">
        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="border-b border-emerald-100 px-5 py-3.5 bg-emerald-50 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-200 flex items-center justify-center">
              <svg width="12" height="12" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[11px] font-mono text-emerald-700 uppercase tracking-[0.15em] font-bold">{t.report.investigationComplete}</p>
          </div>

          <div className="px-6 py-6">
            <p className="text-[20px] font-bold text-[#0a0a0a] tracking-tight mb-1.5">
              Case <span className="font-mono">{caseRef}</span> {t.report.caseSealed}
            </p>
            <p className="text-[13px] text-[#6b7280] leading-relaxed mb-6 max-w-lg">{t.report.caseSealedDesc}</p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: t.report.deepfakeForensics, detail: t.report.loggedScored },
                { label: t.report.distributionTrace, detail: t.report.networksScanned },
                { label: t.report.takedownRequest, detail: t.report.readyToSubmit },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg width="11" height="11" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#0a0a0a] leading-tight">{item.label}</p>
                    <p className="text-[10px] text-[#9ca3af] font-mono">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/verify/upload"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-[#0a0a0a] text-white text-[12px] font-semibold hover:bg-[#1a1a1a] transition-colors shadow-sm"
              >
                {t.report.startNew}
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e8e4de] text-[12px] font-semibold text-[#6b7280] hover:text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                {t.report.exportReport}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
