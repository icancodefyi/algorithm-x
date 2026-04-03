"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { useReportWorkflow } from "@/components/report/ReportWorkflowContext";
import { ContentTrace } from "@/components/report/ContentTrace";

export default function DistributionStepPage() {
  const { caseId, caseData } = useReportWorkflow();
  const { t } = useTranslation();
  if (!caseData) return null;

  return (
    <>
      {/* Section intro */}
      <section className="mb-6">
        <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
          <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
            <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.distributionIntel}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[13.5px] text-[#374151] leading-[1.8]">
              {t.report.distributionDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Content trace widget */}
      <section className="mb-6">
        <ContentTrace caseId={caseId} />
      </section>

      {/* Next step CTA */}
      <div className="mb-6 print:hidden">
        <Link
          href={`/report/${caseId}/takedown`}
          className="flex items-center justify-between gap-4 w-full rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] text-white px-6 py-5 hover:bg-[#1a1a1a] transition-all group shadow-sm"
        >
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/40 mb-1">{t.report.continueStep3}</p>
            <p className="text-[16px] font-bold tracking-tight">{t.report.executeTakedown}</p>
            <p className="text-[12px] text-white/50 mt-0.5">{t.report.executeTakedownDesc}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
      </div>
    </>
  );
}
