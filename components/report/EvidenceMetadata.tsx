"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { AnalysisResult } from "./types";
import { HashDisplay } from "./HashDisplay";
import { formatDateTime } from "./utils";

interface Props {
  analysis: AnalysisResult;
  hashCopied: boolean;
  onCopy: () => void;
}

export function EvidenceMetadata({ analysis, hashCopied, onCopy }: Props) {
  const { t } = useTranslation();
  return (
    <section className="mb-6">
      <div className="border border-[#e8e4de] rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Section header */}
        <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.evidenceMetadata}</p>
        </div>

        <HashDisplay hash={analysis.file_hash} onCopy={onCopy} copied={hashCopied} />

        <div className="grid grid-cols-3 divide-x divide-[#f0ede8] border-t border-[#e8e4de]">
          {[
            { label: "File Size", value: `${(analysis.file_size / 1024).toFixed(1)} KB` },
            { label: "Format", value: analysis.mime_type.split("/")[1].toUpperCase() },
            { label: "Analyzed", value: formatDateTime(analysis.timestamp) },
          ].map((item) => (
            <div key={item.label} className="px-4 py-4">
              <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.15em] mb-1.5">{item.label}</p>
              <p className="text-[13px] text-[#0a0a0a] font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
