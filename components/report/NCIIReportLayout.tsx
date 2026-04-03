"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentTrace } from "./ContentTrace";
import { LeakActionConsole } from "./LeakActionConsole";
import type { CaseData } from "./types";
import { buildCaseRef } from "./utils";
import { formatDate } from "./utils";

interface Props {
  caseId: string;
  caseData: CaseData;
  suspiciousImg: string | null;
  isCaseSaved: boolean;
  isSaving: boolean;
  saveSent: boolean;
  saveEmail: string;
  onSaveEmailChange: (v: string) => void;
  onSendMagicLink: (e: React.FormEvent) => void;
  onSaveCase: () => void;
  sessionUserId?: string;
}

export function NCIIReportLayout({
  caseId,
  caseData,
  suspiciousImg,
  isCaseSaved,
  isSaving,
  saveSent,
  saveEmail,
  onSaveEmailChange,
  onSendMagicLink,
  onSaveCase,
  sessionUserId,
}: Props) {
  const caseRef = buildCaseRef(caseId);
  const reportMeta = [
    { label: "Date", value: formatDate(caseData.created_at) },
    { label: "Source Platform", value: caseData.platform_source },
    { label: "Issue Type", value: caseData.issue_type },
    { label: "Report Type", value: caseData.anonymous ? "Anonymous" : "Named" },
  ];
  const timelineItems = [
    { label: "Case opened", value: new Date(caseData.created_at * 1000).toLocaleString() },
    { label: "Case reference", value: caseRef },
    { label: "Investigation type", value: "NCII Leak Discovery - Pipeline 2" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8] print:bg-white">
      {/* ── Screen navigation bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[#e8e4de] bg-white/95 backdrop-blur-sm px-4 py-3.5 print:hidden sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Sniffer" width={24} height={24} />
            <span className="text-[17px] font-semibold tracking-tight text-[#0a0a0a]">sniffer</span>
          </Link>
          <span className="text-[#d4cfc9]">/</span>
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Investigation Report</span>
          <div className="ml-auto flex items-center gap-2">
            {!isCaseSaved && !saveSent && (
              sessionUserId ? (
                <button
                  onClick={onSaveCase}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors disabled:opacity-50"
                >
                  {isSaving && <div className="h-2.5 w-2.5 rounded-full border-2 border-[#9ca3af] border-t-[#0a0a0a] animate-spin" />}
                  {isSaving ? "Saving…" : "Save report"}
                </button>
              ) : (
                <button
                  onClick={() => document.getElementById("save-well")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors"
                >
                  Save report
                </button>
              )
            )}
            {isCaseSaved && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-1.5 text-[11.5px] font-medium text-[#6b7280]">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Saved
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3.5 py-1.5 text-[11.5px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </header>

      {/* ── Print-only document header ─────────────────────────────────────── */}
      <div className="hidden print:block border-b-2 border-[#0a0a0a] px-0 pb-6 mb-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.32em] text-[#9ca3af] mb-1">Sniffer · Impic Labs</p>
            <p className="text-[22px] font-semibold tracking-tight text-[#0a0a0a]">NCII Investigation Report</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.2em]">Case Reference</p>
            <p className="text-[18px] font-semibold font-mono tracking-tight text-[#0a0a0a]">{caseRef}</p>
            <p className="text-[10px] font-mono text-[#9ca3af] mt-0.5">{formatDate(caseData.created_at)}</p>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 print:max-w-none print:px-0 print:py-0 print:gap-8 sm:px-6">

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 01 — CASE SUMMARY
        ══════════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">01</span>
            <span className="h-px flex-1 bg-[#e8e4de]" />
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">Case Summary</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e8e4de] bg-white print:rounded-none print:border-0 print:border-b print:border-[#e8e4de] print:pb-6">
            <div className="px-6 py-6 sm:px-7 sm:py-7">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.28em] text-[#9ca3af] mb-1.5">Case Reference</p>
                  <h1 className="text-[26px] font-semibold tracking-tight text-[#0a0a0a] sm:text-[30px] print:text-[22px]">{caseRef}</h1>
                </div>
                <span className="inline-flex items-center rounded-full border border-[#e8e4de] bg-[#fafaf8] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#6b7280]">
                  NCII
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
                {reportMeta.map((item) => (
                  <div key={item.label} className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3.5 py-3 print:bg-white">
                    <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">{item.label}</p>
                    <p className="mt-1.5 text-[12.5px] font-medium text-[#0a0a0a]">{item.value}</p>
                  </div>
                ))}
              </div>

              {caseData.description && (
                <div className="mt-5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-4 print:bg-white">
                  <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] mb-2">Complainant Statement</p>
                  <p className="text-[13px] leading-relaxed text-[#374151]">&ldquo;{caseData.description}&rdquo;</p>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-[#e8e4de]">
                <div className="flex flex-wrap gap-3">
                  {timelineItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.22em]">{item.label}:</span>
                      <span className="text-[11px] font-mono text-[#6b7280]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 01b — EVIDENCE RECORDED CONFIRMATION
        ══════════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest mb-1">
                  Step 1 · Evidence Recorded
                </p>
                <p className="text-[14px] font-semibold text-emerald-900 mb-1">
                  Your case has been created anonymously
                </p>
                <p className="text-[12.5px] text-emerald-800 leading-relaxed mb-3">
                  Your evidence has been fingerprinted and a case reference has been issued. 
                  No personally identifiable information is stored. You can use this reference in any legal correspondence.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-[9px] font-mono text-emerald-600 uppercase tracking-widest">Case Reference</p>
                    <p className="text-[13px] font-mono font-semibold text-emerald-900">{buildCaseRef(caseId)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-emerald-600 uppercase tracking-widest">Recorded At</p>
                    <p className="text-[13px] font-mono text-emerald-900">{new Date(caseData.created_at * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-emerald-600 uppercase tracking-widest">Pipeline</p>
                    <p className="text-[13px] font-mono text-emerald-900">NCII Leak Discovery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 02 — SUBMITTED EVIDENCE
        ══════════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">02</span>
            <span className="h-px flex-1 bg-[#e8e4de]" />
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">Submitted Evidence</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e8e4de] bg-white print:rounded-none print:border-0 print:border-b print:border-[#e8e4de] print:pb-6">
            <div className="px-6 py-6 sm:px-7">
              {suspiciousImg ? (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
                  <div className="shrink-0 rounded-lg border border-[#e8e4de] bg-[#fafaf8] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={suspiciousImg}
                      alt="Submitted evidence image"
                      className="h-44 w-44 rounded object-contain sm:h-52 sm:w-52 print:h-40 print:w-40"
                    />
                  </div>
                  <div className="space-y-3 min-w-0">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] mb-1">Image Classification</p>
                      <p className="text-[13px] font-medium text-[#0a0a0a]">Submitted evidence — original media</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] mb-1">Used For</p>
                      <p className="text-[13px] text-[#6b7280] leading-relaxed">
                        Visual hash fingerprinting and perceptual similarity matching across high-risk domains during trace analysis.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3 print:bg-white">
                      <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] mb-1">Integrity Statement</p>
                      <p className="text-[12px] text-[#6b7280] leading-relaxed">
                        Image was submitted directly by the complainant. No modifications were applied prior to analysis.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#9ca3af]">No image was submitted with this case.</p>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 03 — DISCOVERY FINDINGS
        ══════════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">03</span>
            <span className="h-px flex-1 bg-[#e8e4de]" />
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">Discovery Findings</span>
          </div>
          <ContentTrace caseId={caseId} />
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 04 — CASE ACTIONS  (screen only — hidden on print)
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="print:hidden">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">04</span>
            <span className="h-px flex-1 bg-[#e8e4de]" />
            <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.28em]">Removal Actions</span>
          </div>

          {/* Save report well (shown for unauthenticated when not sent) */}
          {!isCaseSaved && !saveSent && !sessionUserId && (
            <div id="save-well" className="mb-6 rounded-xl border border-[#e8e4de] bg-white px-6 py-5">
              <p className="text-[13px] font-medium text-[#0a0a0a] mb-0.5">Save this report</p>
              <p className="text-[12px] text-[#6b7280] mb-4">We&apos;ll email you a magic link — no password needed.</p>
              <form onSubmit={onSendMagicLink} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={saveEmail}
                  onChange={(e) => onSaveEmailChange(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3.5 py-2 text-[12px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:border-[#0a0a0a] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!saveEmail.trim() || isSaving}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                >
                  {isSaving && <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {isSaving ? "Sending…" : "Send link"}
                </button>
              </form>
            </div>
          )}
          {!isCaseSaved && saveSent && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#e8e4de] bg-white px-5 py-4">
              <svg width="14" height="14" fill="none" stroke="#0a0a0a" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <p className="text-[12.5px] text-[#0a0a0a]">Magic link sent to <span className="font-medium">{saveEmail}</span> — click it to save this report.</p>
            </div>
          )}

          {/* Bulk takedown */}
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

          {/* Per-domain removal console */}
          <LeakActionConsole caseId={caseId} />
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════════════════ */}
        <footer className="flex flex-col gap-3 border-t border-[#e8e4de] pt-6 print:border-t-2 print:border-[#0a0a0a] print:pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#9ca3af] uppercase">Sniffer · Impic Labs · 2026</p>
            <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[#b3aaa1]">
              This report is generated automatically as an investigation aid and does not constitute legal advice.
            </p>
          </div>
          <div className="flex gap-4 print:hidden">
            <Link href="/leak" className="text-[12px] font-medium text-[#0a0a0a] hover:opacity-60 transition-opacity">
              New Investigation
            </Link>
            <button onClick={() => window.print()} className="text-[12px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors">
              Print Report
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
