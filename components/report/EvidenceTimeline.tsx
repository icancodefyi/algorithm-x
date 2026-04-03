"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { TimelineEntry } from "./utils";
import { formatTime } from "./utils";

interface Props {
  entries: TimelineEntry[];
}

export function EvidenceTimeline({ entries }: Props) {
  const { t } = useTranslation();
  return (
    <section className="mb-6">
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
        {/* Section header */}
        <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.evidenceTimeline}</p>
        </div>

        <div className="px-6 py-5">
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-[#e8e4de]" />
            <div className="space-y-5">
              {entries.map((entry, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 shrink-0 ${
                    i === 0 ? "border-[#0a0a0a] bg-[#0a0a0a]" : "border-[#0a0a0a] bg-white"
                  }`} />
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-[10px] text-[#c4bdb5] tracking-wider bg-[#fafaf8] px-2 py-0.5 rounded border border-[#f0ede8]">{formatTime(entry.ts)}</span>
                      <span className="text-[13px] font-semibold text-[#0a0a0a]">{entry.event}</span>
                    </div>
                    <p className="text-[11.5px] text-[#9ca3af] mt-0.5 leading-relaxed">{entry.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
