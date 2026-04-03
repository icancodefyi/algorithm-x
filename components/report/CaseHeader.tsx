"use client";

import type { CaseData } from "./types";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { formatDate } from "./utils";

interface Props {
  caseRef: string;
  verdict: string;
  verdictColor: string;
  caseData: CaseData;
  forensicCertainty?: string;
  tamperRegionCount?: number;
}

export function CaseHeader({ caseRef, caseData }: Props) {
  const { t } = useTranslation();
  const fields = [
    { label: t.report.caseRef, value: caseRef, mono: true },
    { label: t.report.dateFiled, value: formatDate(caseData.created_at) },
    { label: t.report.sourcePlatform, value: caseData.platform_source },
    { label: t.report.issueType, value: caseData.issue_type },
    { label: t.report.reportType, value: caseData.anonymous ? t.report.anonymous : t.report.named },
  ];

  return (
    <div className="mb-6">
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5">
          {fields.map((item, i) => (
            <div
              key={item.label}
              className={`px-4 py-4 ${
                i < fields.length - 1 ? "border-r border-[#f0ede8]" : ""
              } ${i >= 2 ? "border-t sm:border-t-0 border-[#f0ede8]" : ""}`}
            >
              <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.2em] mb-1.5">{item.label}</p>
              <p className={`text-[13px] font-semibold text-[#0a0a0a] leading-tight ${item.mono ? "font-mono tracking-tight" : ""}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {caseData.description && (
          <div className="border-t border-[#f0ede8] px-4 py-3.5 bg-[#fafaf8]">
            <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.2em] mb-1.5">{t.report.victimStatement}</p>
            <p className="text-[12.5px] text-[#374151] leading-relaxed italic">
              &ldquo;{caseData.description}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
