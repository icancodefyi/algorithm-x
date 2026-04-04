"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaseHeader } from "@/components/report/CaseHeader";
import { NCIIReportLayout } from "@/components/report/NCIIReportLayout";
import { CaseAnalyst } from "@/components/report/CaseAnalyst";
import { buildCaseRef, buildVerdict, buildVerdictColor } from "@/components/report/utils";
import { useReportWorkflow } from "@/components/report/ReportWorkflowContext";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const STEPS = [
  { id: "analysis" as const, num: "01", label: "Forensic Analysis", shortLabel: "Analysis" },
  { id: "distribution" as const, num: "02", label: "Distribution Trace", shortLabel: "Distribution" },
  { id: "takedown" as const, num: "03", label: "Takedown & Response", shortLabel: "Takedown" },
] as const;

const STEP_ICONS: Record<string, React.ReactNode> = {
  analysis: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  distribution: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  takedown: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function StepNav({ caseId, isNcii }: { caseId: string; isNcii?: boolean }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const labelMap: Record<string, string> = {
    analysis: t.report.stepAnalysis,
    distribution: t.report.stepDistribution,
    takedown: t.report.stepTakedown,
  };

  const steps = STEPS.map((s) => ({
    ...s,
    label: s.id === "analysis" && isNcii ? "Record Evidence" : (labelMap[s.id] ?? s.label),
    shortLabel: s.id === "analysis" && isNcii ? "Evidence" : s.shortLabel,
    href: `/report/${caseId}/${s.id}`,
  }));

  const activeIdx = steps.findIndex((s) => pathname === s.href);

  return (
    <nav className="mb-8 print:hidden">
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
        <div className="flex">
          {steps.map((step, idx) => {
            const active = idx === activeIdx;
            const isDone = idx < activeIdx;

            return (
              <Link
                key={step.id}
                href={step.href}
                className={`flex-1 flex items-center gap-3 px-4 py-3.5 transition-all relative ${
                  idx < steps.length - 1 ? "border-r border-[#e8e4de]" : ""
                } ${
                  active
                    ? "bg-[#0a0a0a] text-white"
                    : isDone
                    ? "bg-emerald-50/80 text-emerald-800 hover:bg-emerald-50"
                    : "bg-white text-[#9ca3af] hover:bg-[#fafaf8] hover:text-[#6b7280]"
                }`}
              >
                {/* Step number / check */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0 transition-all ${
                  active
                    ? "bg-white/15 text-white"
                    : isDone
                    ? "bg-emerald-200/80 text-emerald-700"
                    : "bg-[#f5f3f0] text-[#c4bdb5]"
                }`}>
                  {isDone ? (
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : step.num}
                </div>

                {/* Labels */}
                <div className="min-w-0 flex-1">
                  <p className={`text-[12.5px] font-semibold leading-tight truncate ${
                    active ? "text-white" : isDone ? "text-emerald-800" : "text-[#374151]"
                  }`}>
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.shortLabel}</span>
                  </p>
                  <p className={`text-[10px] font-mono mt-0.5 ${
                    active ? "text-white/50" : isDone ? "text-emerald-600/60" : "text-[#c4bdb5]"
                  }`}>
                    {isDone ? t.report.completed : active ? t.report.inProgress : `${t.report.step} ${step.num}`}
                  </p>
                </div>

                {/* Icon on active */}
                {active && (
                  <div className="ml-auto shrink-0 text-white/40 hidden sm:block">
                    {STEP_ICONS[step.id]}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#f0ede8]">
          <div
            className="h-full bg-[#0a0a0a] transition-all duration-500 ease-out"
            style={{ width: `${((activeIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}

export function ReportWorkflowShell({ children }: { children: React.ReactNode }) {
  const {
    caseId,
    caseData,
    analysis,
    suspiciousImg,
    loading,
    fetchError,
    hashCopied,
    copyHash,
    isCaseSaved,
    isSaving,
    handleSaveCase,
  } = useReportWorkflow();

  const [analystOpen, setAnalystOpen] = useState(false);
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#e8e4de] border-t-[#0a0a0a] rounded-full animate-spin mx-auto mb-5" />
          <p className="text-[13px] text-[#6b7280] font-mono tracking-wider">{t.report.loading}</p>
          <p className="text-[10px] text-[#c4bdb5] font-mono mt-1.5 tracking-widest uppercase">{t.report.loadingDetail}</p>
        </div>
      </div>
    );
  }

  if (fetchError || !caseData) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-[#0a0a0a] mb-1">{t.report.reportUnavailable}</p>
          <p className="text-[13px] text-[#6b7280] mb-5">{fetchError ?? "The requested case could not be found."}</p>
          <Link href="/start" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0a0a0a] hover:underline">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.report.newInvestigation}
          </Link>
        </div>
      </div>
    );
  }

  if (caseData.pipeline_type === "ncii") {
    return (
      <NCIIReportLayout
        caseId={caseId}
        caseData={caseData}
        suspiciousImg={suspiciousImg}
        isCaseSaved={isCaseSaved}
        isSaving={isSaving}
        onSaveCase={handleSaveCase}
      />
    );
  }

  const caseRef = buildCaseRef(caseId);
  const verdict = analysis ? buildVerdict(analysis) : "ANALYSIS PENDING";
  const verdictColor = analysis
    ? buildVerdictColor(analysis)
    : "text-slate-700 bg-slate-50 border-slate-300";
  const headerCertainty =
    analysis?.forensic_certainty === "AI-Generated (C2PA Verified)"
      ? analysis.forensic_certainty
      : undefined;

  return (
    <div className="min-h-screen bg-[#fafaf8] print:bg-white">
      {/* ── Top bar ── */}
      <header className="border-b border-[#e8e4de] bg-white/95 backdrop-blur-sm print:hidden sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-6 h-6 rounded-md bg-[#0a0a0a] flex items-center justify-center">
                <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase font-bold">Sniffer</span>
            </Link>

            <div className="flex items-center gap-1.5 text-[#c4bdb5]">
              <svg width="4" height="10" viewBox="0 0 4 10"><path d="M0 10L4 0" stroke="currentColor" strokeWidth="1" /></svg>
            </div>
            <span className="text-[11.5px] text-[#9ca3af] font-mono uppercase tracking-wider">{t.report.forensicReport}</span>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={copyHash}
                className="text-[11px] text-[#6b7280] hover:text-[#0a0a0a] border border-[#e8e4de] hover:border-[#c4bdb5] px-3 py-1.5 rounded-lg transition-colors font-mono"
              >
                {hashCopied ? t.report.copied : t.report.copyHash}
              </button>
              <button
                onClick={() => window.print()}
                className="text-[11px] font-semibold bg-[#0a0a0a] text-white px-4 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                {t.report.exportPdf}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:py-6 print:px-10">
        {/* ── Document header strip ── */}
        <div className="mb-6 flex items-center justify-between print:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-[#0a0a0a] rounded-full" />
            <div>
              <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.25em]">Forensic Evidence Report</p>
              <p className="text-[15px] font-mono font-bold text-[#0a0a0a] tracking-tight">{caseRef}</p>
            </div>
          </div>
          <div className="text-right hidden sm:flex flex-col items-end gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a0a0a] text-[9px] font-mono text-white/80 uppercase tracking-[0.2em]">
              <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              {t.report.confidential}
            </span>
            <p className="text-[9px] font-mono text-[#c4bdb5] mt-1">Impic Labs · 2026</p>
          </div>
        </div>

        <CaseHeader
          caseRef={caseRef}
          verdict={verdict}
          verdictColor={verdictColor}
          caseData={caseData}
          forensicCertainty={headerCertainty}
          tamperRegionCount={analysis?.tamper_regions?.length}
        />

        <StepNav caseId={caseId} isNcii={caseData.pipeline_type === "ncii"} />

        {children}

        {/* ── Footer ── */}
        <footer className="border-t border-[#e8e4de] pt-6 mt-10 print:border-[#0a0a0a]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded bg-[#0a0a0a] flex items-center justify-center">
                  <svg width="8" height="8" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p className="font-mono text-[10px] text-[#6b7280] tracking-widest uppercase font-semibold">Sniffer by Impic Labs</p>
              </div>
              <p className="font-mono text-[9px] text-[#c4bdb5] leading-relaxed max-w-md">
                {t.report.disclaimer}
              </p>
            </div>
            <div className="flex gap-4 print:hidden shrink-0">
              <Link href="/start" className="text-[11px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors font-medium">
                {t.report.newInvestigation}
              </Link>
              <button onClick={() => window.print()} className="text-[11px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors font-medium">
                {t.report.printReport}
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Analyst toggle ── */}
      <button
        onClick={() => setAnalystOpen(true)}
        className="fixed bottom-6 right-6 z-30 print:hidden flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full bg-[#0a0a0a] text-white shadow-lg shadow-black/20 hover:bg-[#1a1a1a] hover:scale-[1.03] active:scale-100 transition-all group"
      >
        <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[12px] font-semibold tracking-wide">{t.report.askAnalyst}</span>
      </button>

      {/* ── Analyst panel ── */}
      <CaseAnalyst open={analystOpen} onClose={() => setAnalystOpen(false)} />
    </div>
  );
}
