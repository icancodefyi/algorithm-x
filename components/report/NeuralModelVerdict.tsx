"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { AiDetectionResult } from "./types";

interface Props {
  ai?: AiDetectionResult | null;
}

function getConfidenceBand(prob: number) {
  if (prob >= 0.80) return {
    label: "High Confidence — AI Generated",
    color: "text-red-700", barColor: "bg-red-500",
    bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500",
  };
  if (prob >= 0.60) return {
    label: "Elevated Suspicion — Likely Manipulated",
    color: "text-amber-700", barColor: "bg-amber-400",
    bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400",
  };
  if (prob >= 0.40) return {
    label: "Inconclusive — Mixed Signals",
    color: "text-[#6b7280]", barColor: "bg-gray-400",
    bg: "bg-[#fafaf8]", border: "border-[#e8e4de]", dot: "bg-gray-400",
  };
  return {
    label: "Low Risk — Likely Authentic",
    color: "text-emerald-700", barColor: "bg-emerald-500",
    bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500",
  };
}

export function NeuralModelVerdict({ ai }: Props) {
  const { t } = useTranslation();
  if (!ai) return null;

  const modelProb = ai.model_probability ?? null;
  const heuristicProb = ai.heuristic_probability ?? ai.ai_probability;
  const fusedProb = ai.ai_probability;
  const hasModel = modelProb !== null && !ai.model_error;
  const modelName = ai.model_name ?? "prithivMLmods/Deep-Fake-Detector-v2-Model";
  const modelLabel = ai.model_label ?? "Deepfake";

  const band = getConfidenceBand(fusedProb);
  const finalPct = Math.round(fusedProb * 100);

  return (
    <section className="mb-6">
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
        {/* Section header */}
        <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.neuralModel}</p>
        </div>

        {/* Verdict strip */}
        <div className={`${band.bg} px-5 py-3 flex items-center gap-3 border-b ${band.border}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${band.dot}`} />
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${band.color}`}>
            {band.label}
          </span>
          {hasModel && (
            <span className="ml-auto text-[10px] font-mono text-[#c4bdb5] hidden sm:block truncate max-w-55">
              {modelName}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {hasModel ? (
            <>
              <p className="text-[12px] text-[#6b7280] mb-4 leading-relaxed">
                Supporting metrics used to compute the final risk score shown above.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MetricCard label="Deepfake Model Score" value={`${Math.round(modelProb! * 100)}%`} detail={`${modelLabel} · ${modelName.split("/").pop()}`} />
                <MetricCard label="Forensic Artifact Score" value={`${Math.round(heuristicProb * 100)}%`} detail="FFT · PRNU · CA analysis" />
              </div>

              <div className="mt-3 rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.15em] mb-1">Final Score Composition</p>
                    <p className="text-[16px] font-bold text-[#0a0a0a]">{finalPct}% <span className="text-[12px] font-normal text-[#6b7280]">final authenticity risk</span></p>
                  </div>
                  <p className="text-[10px] font-mono text-[#c4bdb5]">95% model + 5% forensic</p>
                </div>
                <div className="h-2.5 w-full bg-[#e8e4de] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${band.barColor}`} style={{ width: `${finalPct}%` }} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-[48px] font-extrabold leading-none tracking-tight text-[#6b7280] font-mono tabular-nums">
                  {Math.round(fusedProb * 100)}%
                </span>
                <div className="pb-1.5">
                  <p className="text-[12px] font-semibold text-[#0a0a0a]">AI probability (forensic signals)</p>
                  <p className="text-[10.5px] text-[#c4bdb5] font-mono">Neural model unavailable — heuristic fallback active</p>
                </div>
              </div>
              <div className="h-2.5 w-full bg-[#e8e4de] rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full ${band.barColor}`} style={{ width: `${Math.round(fusedProb * 100)}%` }} />
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-[11px] text-amber-700 font-mono leading-relaxed">
                  Neural model inference unavailable. Score derived from FFT spectral grid, PRNU kurtosis, and chromatic aberration analysis only.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-4 py-4">
      <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.15em] mb-1.5">{label}</p>
      <p className="text-[18px] font-bold text-[#0a0a0a]">{value}</p>
      <p className="text-[10.5px] text-[#9ca3af] mt-0.5 font-mono">{detail}</p>
    </div>
  );
}
