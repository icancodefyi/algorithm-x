"use client";

import { useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { AuditTrail as AuditTrailType } from "./types";

interface Props {
  audit: AuditTrailType;
}

export function AuditTrail({ audit }: Props) {
  const { t } = useTranslation();
  const [hashCopied, setHashCopied] = useState(false);

  function copyReportHash() {
    navigator.clipboard.writeText(audit.report_hash).then(() => {
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    });
  }

  const timestamp = new Date(audit.analysis_timestamp * 1000).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return (
    <section className="mb-6">
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
        {/* Section header */}
        <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
          <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.chainOfCustody}</p>
        </div>

        <div className="px-5 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Pipeline", value: `v${audit.pipeline_version}` },
              { label: "Algorithms", value: `${audit.algorithms_run.length} run` },
              { label: "Analysed At", value: timestamp, span: true },
            ].map((item) => (
              <div key={item.label} className={item.span ? "col-span-2" : ""}>
                <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.15em] mb-1">{item.label}</p>
                <p className="text-[12.5px] font-mono text-[#374151] font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Report hash */}
          <div className="rounded-xl border border-[#e8e4de] bg-[#0a0a0a] px-4 py-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono text-[#4b5563] uppercase tracking-[0.15em] mb-1">Report Hash (SHA-256)</p>
              <p className="font-mono text-[10.5px] text-[#e5e7eb] truncate">{audit.report_hash}</p>
            </div>
            <button
              onClick={copyReportHash}
              className="shrink-0 text-[10px] font-mono border border-[#374151] px-3 py-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:border-[#6b7280] transition-colors print:hidden"
            >
              {hashCopied ? "Copied" : "Copy"}
            </button>
          </div>

          <p className="text-[10px] text-[#c4bdb5] mt-2 font-mono">
            This report hash can be used to verify that the document has not been altered since generation.
          </p>

          {/* Algorithms list */}
          <details className="mt-4 print:hidden">
            <summary className="text-[10px] font-mono text-[#c4bdb5] cursor-pointer hover:text-[#6b7280] transition-colors uppercase tracking-[0.15em] font-semibold">
              View algorithms run ({audit.algorithms_run.length})
            </summary>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {audit.algorithms_run.map((alg) => (
                <span
                  key={alg}
                  className="text-[10px] font-mono bg-[#fafaf8] border border-[#e8e4de] px-2.5 py-1 rounded-lg text-[#6b7280]"
                >
                  {alg.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
