"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReportWorkflow } from "@/components/report/ReportWorkflowContext";
import {
  buildFinalRiskScore,
  buildModelFirstSummary,
  buildSignalRows,
} from "@/components/report/utils";
import { ImageEvidence } from "@/components/report/ImageEvidence";
import { C2PAProvenance } from "@/components/report/C2PAProvenance";
import { NeuralModelVerdict } from "@/components/report/NeuralModelVerdict";
import { ForensicSignals } from "@/components/report/ForensicSignals";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const POLL_STEPS = [
  "Verifying image metadata…",
  "Scanning manipulation signals…",
  "Running neural deepfake model…",
  "Computing forensic risk score…",
  "Finalising report…",
];

export default function AnalysisStepPage() {
  const { caseId, caseData, analysis, suspiciousImg, referenceImg, evidenceImg } = useReportWorkflow();

  const [polling, setPolling] = useState(false);
  const [pollStep, setPollStep] = useState(0);
  const [pollError, setPollError] = useState<string | null>(null);
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!caseData || analysis || pollingRef.current) return;
    if (caseData.pipeline_type === "ncii") return;

    pollingRef.current = true;
    setPolling(true);
    setPollError(null);

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, POLL_STEPS.length - 1);
      setPollStep(stepIdx);
    }, 900);

    let attempts = 0;
    const maxAttempts = 20;

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/api/analysis/${caseId}/result`);
        if (res.ok) {
          clearInterval(stepInterval);
          setPolling(false);
          window.location.reload();
          return;
        }
      } catch { /* keep polling */ }

      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(stepInterval);
        setPolling(false);
        setPollError("Analysis is taking longer than expected. Please refresh the page.");
        return;
      }
      setTimeout(poll, 2000);
    }

    void poll();

    return () => clearInterval(stepInterval);
  }, [caseId, caseData, analysis]);

  const { t } = useTranslation();

  if (!caseData) return null;

  if (!analysis) {
    return (
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
        <div className="border-b border-[#f0ede8] px-5 py-3.5 bg-[#fafaf8]">
          <p className="text-[10px] font-mono text-[#c4bdb5] uppercase tracking-[0.2em]">
            {t.report.step} 01 · {t.report.stepAnalysis}
          </p>
        </div>
        <div className="px-6 py-12">
          {polling ? (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] flex items-center justify-center mx-auto mb-6">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
              <p className="text-[16px] font-bold text-[#0a0a0a] mb-1">{t.report.runningAnalysis}</p>
              <p className="text-[12px] text-[#9ca3af] font-mono mb-8">{POLL_STEPS[pollStep]}</p>
              <div className="space-y-2.5">
                {POLL_STEPS.map((step, i) => (
                  <div key={step} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    i === pollStep ? "bg-[#0a0a0a] text-white" : i < pollStep ? "bg-emerald-50" : "bg-[#fafaf8]"
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                      i < pollStep
                        ? "bg-emerald-200 text-emerald-700"
                        : i === pollStep
                        ? "bg-white/15 text-white"
                        : "bg-[#e8e4de] text-[#c4bdb5]"
                    }`}>
                      {i < pollStep ? (
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (i + 1)}
                    </div>
                    <p className={`text-[12px] text-left ${
                      i < pollStep ? "text-emerald-700 line-through decoration-emerald-300"
                      : i === pollStep ? "text-white font-medium"
                      : "text-[#c4bdb5]"
                    }`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : pollError ? (
            <div className="text-center">
              <p className="text-[13px] text-[#374151] mb-3">{pollError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[12px] font-medium bg-[#0a0a0a] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                {t.report.refreshPage}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const score = buildFinalRiskScore(analysis);
  const summaryText = buildModelFirstSummary(analysis);
  const signalRows = buildSignalRows(analysis);
  const showEla = Boolean(analysis.reference_based);

  const isManipulated = score >= 85;
  const isHigh = score >= 70 && score < 85;
  const isMedium = score >= 50 && score < 70;

  const verdictLabel = isManipulated ? t.report.likelyManipulated
    : isHigh ? t.report.highSuspicion
    : isMedium ? t.report.inconclusive
    : t.report.likelyAuthentic;

  const v = isManipulated ? { border: "border-red-200", bg: "bg-red-50", text: "text-red-800", score: "text-red-600", dot: "bg-red-500", ring: "#dc2626", ringBg: "rgba(220,38,38,0.08)", glow: "shadow-red-100/50" }
    : isHigh ? { border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-800", score: "text-orange-600", dot: "bg-orange-500", ring: "#ea580c", ringBg: "rgba(234,88,12,0.08)", glow: "shadow-orange-100/50" }
    : isMedium ? { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-800", score: "text-amber-600", dot: "bg-amber-400", ring: "#d97706", ringBg: "rgba(217,119,6,0.08)", glow: "shadow-amber-100/50" }
    : { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-800", score: "text-emerald-600", dot: "bg-emerald-500", ring: "#16a34a", ringBg: "rgba(22,163,74,0.08)", glow: "shadow-emerald-100/50" };

  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <>
      {/* ━━ Verdict ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className={`mb-6 rounded-xl border-2 ${v.border} overflow-hidden shadow-sm ${v.glow}`}>
        <div className={`${v.bg} px-6 py-6 flex items-center gap-6`}>
          {/* Score ring */}
          <div className="shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} fill={v.ringBg} stroke="rgba(0,0,0,0.04)" strokeWidth="7" />
              <circle
                cx="50" cy="50" r={r} fill="none"
                stroke={v.ring} strokeWidth="7"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 1.2s ease" }}
              />
              <text x="50" y="47" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0a0a0a" fontFamily="system-ui, sans-serif">{score}</text>
              <text x="50" y="62" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace" letterSpacing="0.12em">/100</text>
            </svg>
          </div>

          {/* Verdict copy */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              <p className={`text-[9px] font-mono uppercase tracking-[0.25em] ${v.text} font-semibold`}>{t.report.forensicVerdict}</p>
            </div>
            <p className={`text-[24px] font-bold tracking-tight leading-none ${v.text}`}>{verdictLabel}</p>
            <p className="text-[12.5px] text-[#6b7280] leading-relaxed mt-2">
              {isManipulated ? t.report.manipulatedDesc
                : isHigh ? t.report.highDesc
                : isMedium ? t.report.inconclusiveDesc
                : t.report.authenticDesc}
            </p>
            {analysis.forensic_certainty && (
              <p className={`text-[10px] font-mono mt-2.5 px-2.5 py-1 rounded-md inline-block border ${v.border} ${v.bg} ${v.text} font-semibold`}>
                {analysis.forensic_certainty}
              </p>
            )}
          </div>

          {/* Large score (desktop) */}
          <div className="shrink-0 hidden sm:flex flex-col items-end">
            <p className={`text-[52px] font-extrabold leading-none font-mono tabular-nums ${v.score}`}>{score}</p>
            <p className="text-[9px] text-[#c4bdb5] font-mono mt-1 uppercase tracking-[0.2em]">{t.report.riskScore}</p>
          </div>
        </div>
      </section>

      {/* ━━ Submitted Evidence ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard icon={<IconImage />} title={t.report.submittedEvidence}>
        <ImageEvidence
          suspiciousImg={suspiciousImg}
          referenceImg={referenceImg}
          tamperHeatmap={showEla ? analysis.tamper_heatmap : undefined}
        />
      </SectionCard>

      {/* ━━ Analysis Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard icon={<IconDoc />} title={t.report.analysisSummary}>
        <p className="text-[13.5px] text-[#374151] leading-[1.85]">{summaryText}</p>
      </SectionCard>

      {/* ━━ Neural Model ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <NeuralModelVerdict ai={analysis.ai_detection} />

      {/* ━━ Forensic Signals ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {signalRows.length > 0 && <ForensicSignals rows={signalRows} />}

      {/* ━━ C2PA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <C2PAProvenance c2pa={analysis.c2pa_result} />

      {/* ━━ Supporting Evidence ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {analysis.supporting_evidence && (
        <SectionCard icon={<IconUpload />} title={t.report.supportingEvidence}>
          <div className="flex gap-4 items-start">
            {evidenceImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={evidenceImg}
                alt="Supporting evidence"
                className="w-20 h-20 object-cover rounded-lg border border-[#e8e4de] shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 space-y-2.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider ${
                analysis.supporting_evidence.ela_flagged
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${analysis.supporting_evidence.ela_flagged ? "bg-red-500" : "bg-emerald-500"}`} />
                {analysis.supporting_evidence.ela_flagged ? "Editing Artifacts Detected" : "No Artifacts Detected"}
              </span>
              <p className="text-[12.5px] text-[#374151] leading-relaxed">{analysis.supporting_evidence.manipulation_note}</p>
              <p className="text-[10.5px] text-[#c4bdb5] font-mono">
                SHA-256: {analysis.supporting_evidence.sha256.slice(0, 24)}…
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ━━ Next Step CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-6 print:hidden">
        <Link
          href={`/report/${caseId}/distribution`}
          className="flex items-center justify-between gap-4 w-full rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] text-white px-6 py-5 hover:bg-[#1a1a1a] transition-all group shadow-sm"
        >
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/40 mb-1">{t.report.continueStep2}</p>
            <p className="text-[16px] font-bold tracking-tight">{t.report.traceDistribution}</p>
            <p className="text-[12px] text-white/50 mt-0.5">{t.report.traceDistributionDesc}</p>
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

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">
        <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
          <span className="text-[#9ca3af]">{icon}</span>
          <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{title}</p>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </section>
  );
}

function IconImage() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
