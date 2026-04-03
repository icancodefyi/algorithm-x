"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { extractDomain } from "@/lib/url";
import { openMailtoDraft } from "@/lib/mailto";

const LOGO_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY ?? "";

interface TakedownData {
  domain: string;
  found: boolean;
  removal_type: string | null;
  removal_page: string | null;
  contact_email: string | null;
  status: "verified" | "partial" | "unverified" | "scraped" | "not_found";
  confidence: number;
  source: "dataset" | "scraped" | "not_found";
}

interface IntelligenceData {
  domain: string;
  found: boolean;
  cdn_provider: string | null;
  network: string | null;
  confidence: number;
  source: string;
}

const STATUS_CFG = {
  verified:   { dot: "bg-emerald-500", label: "Verified",   pill: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  partial:    { dot: "bg-amber-400",   label: "Partial",    pill: "bg-amber-50 border-amber-200 text-amber-700" },
  unverified: { dot: "bg-orange-400",  label: "Unverified", pill: "bg-orange-50 border-orange-200 text-orange-700" },
  scraped:    { dot: "bg-blue-400",    label: "Live Scan",  pill: "bg-blue-50 border-blue-200 text-blue-700" },
  not_found:  { dot: "bg-gray-300",    label: "Not Found",  pill: "bg-gray-50 border-gray-200 text-gray-500" },
} as const;

interface Props {
  platform: string;
  steps?: string[];
  caseId?: string;
  fileHash?: string;
  caseRef?: string;
}

function buildEmailDraft(domain: string, contentUrl: string, caseRef?: string, fileHash?: string): string {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const urlLine = contentUrl.trim() ? `\nContent URL: ${contentUrl.trim()}\n` : "";
  const evidenceBlock = caseRef
    ? `\n──────────────────────────────────────\nForensic Evidence (Sniffer · Impic Labs)\nCase Reference: ${caseRef}${fileHash ? `\nSHA-256 Hash:   ${fileHash}` : ""}\n──────────────────────────────────────\n`
    : "";
  return `Dear ${domain} Content Moderation Team,\n\nI am formally requesting the immediate removal of content hosted on ${domain} that was published without my knowledge or consent.${urlLine}${evidenceBlock}\nThis material is a serious violation of my privacy and your platform's own terms of service. I request its complete removal — including all thumbnails, previews, and cached copies — as a matter of urgency.\n\nPlease confirm removal within 48 hours. Failure to act will result in escalation to your hosting provider, domain registrar, and relevant legal authorities.\n\nRegards,\n[Your Full Name]\n${date}`;
}

function buildFormScript(domain: string, contentUrl: string): string {
  const urlLine = contentUrl.trim() ? ` The specific content is located at: ${contentUrl.trim()}.` : "";
  return `I am formally requesting the removal of content hosted on ${domain} that was published without my consent.${urlLine} This is a serious violation of my privacy. I demand its immediate and complete removal, including all cached copies, thumbnails, and any derivatives. Failure to act within 48 hours will result in escalation to the hosting provider, domain registrar, and relevant authorities.`;
}

function PlatformLogoIcon({ domain, platformName }: { domain: string | null; platformName: string }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (!domain || logoFailed) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
        <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl border border-[#e8e4de] bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
      <Image
        src={`https://img.logo.dev/${domain}?token=${LOGO_KEY}&size=64`}
        alt={`${platformName} logo`}
        width={32}
        height={32}
        onError={() => setLogoFailed(true)}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

function StepBadge({ num, active }: { num: number; active?: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono text-[11px] font-bold transition-colors ${
      active ? "bg-[#0a0a0a] text-white" : "bg-[#f0ede8] text-[#9ca3af] border border-[#e8e4de]"
    }`}>
      {num}
    </div>
  );
}

export function TakedownGuidance({ platform, steps, caseId: _caseId, fileHash, caseRef }: Props) {
  const [takedown, setTakedown] = useState<TakedownData | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [contentUrl, setContentUrl] = useState("");
  const [draftCopied, setDraftCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const domain = platform.includes(".") ? extractDomain(platform) : null;
  const hasSteps = !!steps?.length;

  useEffect(() => {
    if (!domain || hasSteps) { setFetching(false); return; }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    setFetching(true);
    Promise.allSettled([
      fetch(`/api/takedown/${encodeURIComponent(domain)}`, { signal: controller.signal }),
      fetch(`/api/intelligence/${encodeURIComponent(domain)}`, { signal: controller.signal }),
    ]).then(([tdRes, intelRes]) => {
      if (tdRes.status === "fulfilled" && tdRes.value.ok)
        void (tdRes.value.json() as Promise<TakedownData>).then(setTakedown);
      if (intelRes.status === "fulfilled" && intelRes.value.ok)
        void (intelRes.value.json() as Promise<IntelligenceData>).then(setIntelligence);
    }).finally(() => { clearTimeout(timeoutId); setFetching(false); });

    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, [domain, hasSteps]);

  if (!hasSteps && !domain) return null;

  const statusCfg = STATUS_CFG[takedown?.status ?? "not_found"];

  return (
    <section className="mb-6">
      <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">

        {/* ── Header ── */}
        <div className="bg-[#0a0a0a] px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <PlatformLogoIcon domain={domain} platformName={platform} />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">
                Remove content from {platform}
              </p>
              <p className="text-[11px] text-white/40 font-mono">
                {takedown?.source === "scraped" ? "Retrieved via live scan" : domain ? "Sniffer dataset" : "Manual steps"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {takedown?.found && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${statusCfg.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            )}
            {caseRef && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-700/30 bg-emerald-900/30 text-[10px] font-mono text-emerald-400">
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                Evidence attached
              </span>
            )}
          </div>
        </div>

        {/* ── Evidence badge (mobile) ── */}
        {caseRef && (
          <div className="sm:hidden mx-4 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50">
            <svg width="12" height="12" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[11px] text-emerald-800">
              <span className="font-semibold">Forensic evidence attached</span>
              <span className="text-emerald-600 font-mono"> · {caseRef}</span>
            </p>
          </div>
        )}

        {/* ── Step navigation ── */}
        <div className="border-b border-[#f0ede8] px-4 sm:px-6">
          <div className="flex items-center gap-1">
            {[
              { num: 1, label: "Gather Evidence" },
              { num: 2, label: "Send Request" },
              { num: 3, label: "Escalation" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3.5 text-[12px] font-medium border-b-2 transition-colors ${
                  activeStep === s.num
                    ? "border-[#0a0a0a] text-[#0a0a0a]"
                    : "border-transparent text-[#9ca3af] hover:text-[#6b7280]"
                }`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-mono font-bold ${
                  activeStep === s.num ? "bg-[#0a0a0a] text-white" : "bg-[#f0ede8] text-[#9ca3af]"
                }`}>{s.num}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Fetching skeleton ── */}
        {fetching && (
          <div className="px-6 py-8 space-y-3 animate-pulse">
            <div className="h-3.5 w-48 bg-[#f0ede8] rounded" />
            <div className="h-10 w-full bg-[#f0ede8] rounded-lg" />
            <div className="h-28 w-full bg-[#f0ede8] rounded-xl" />
          </div>
        )}

        {!fetching && (
          <div className="px-4 sm:px-6 py-6">

            {/* ── Step 1: Gather Evidence ── */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <StepBadge num={1} active />
                  <div>
                    <p className="text-[14px] font-semibold text-[#0a0a0a] mb-0.5">Gather your evidence</p>
                    <p className="text-[12px] text-[#6b7280] leading-relaxed">
                      Before filing a removal request, ensure you have all the evidence collected.
                    </p>
                  </div>
                </div>

                {caseRef && (
                  <div className="ml-10 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <svg width="12" height="12" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-[11.5px] text-emerald-700">
                      Sniffer report <span className="font-mono font-semibold">{caseRef}</span> covers items 1, 3, and 4 below.
                    </p>
                  </div>
                )}

                <div className="ml-10 space-y-2">
                  {[
                    { text: "Screenshot the page with the content clearly visible", done: !!caseRef },
                    { text: "Copy the direct URL of the specific content",           done: false },
                    { text: "Note the date you first found it",                      done: !!caseRef },
                    { text: "Save your Sniffer report — valid supporting evidence",  done: !!caseRef },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                      item.done
                        ? "bg-emerald-50/50 border-emerald-200/60"
                        : "bg-[#fafaf8] border-[#e8e4de]"
                    }`}>
                      {item.done ? (
                        <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
                          <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-[#d4cfc9] shrink-0" />
                      )}
                      <span className={`text-[12.5px] ${item.done ? "text-[#9ca3af] line-through decoration-[#d4cfc9]" : "text-[#374151]"}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="ml-10 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0a0a0a] text-white text-[12px] font-semibold hover:bg-[#1a1a1a] transition-colors"
                  >
                    Continue to removal request
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Send Request ── */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <StepBadge num={2} active />
                  <div>
                    <p className="text-[14px] font-semibold text-[#0a0a0a] mb-0.5">Send your removal request</p>
                    <p className="text-[12px] text-[#6b7280]">
                      Paste the content URL to personalise your draft, then send via email or the platform form.
                    </p>
                  </div>
                </div>

                <div className="ml-10 space-y-4">
                  {/* URL input */}
                  <div>
                    <label className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1.5 block">
                      Content URL <span className="text-[#c4bdb5]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="https://example.com/content-page"
                      className="w-full rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-4 py-3 text-[13px] text-[#374151] placeholder:text-[#c4bdb5] focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]/5 transition-all"
                    />
                  </div>

                  {/* Live scan warning */}
                  {takedown?.source === "scraped" && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                      </svg>
                      <p className="text-[12px] text-amber-800 leading-relaxed">
                        <span className="font-semibold">Live scan result —</span> verify the removal link is correct before submitting.
                      </p>
                    </div>
                  )}

                  {domain && takedown?.found ? (
                    takedown.contact_email ? (
                      /* ── Email Draft Card ── */
                      <div className="rounded-xl border border-[#e8e4de] overflow-hidden shadow-sm">
                        <div className="px-5 py-3 bg-[#fafaf8] border-b border-[#f0ede8] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                              <svg width="12" height="12" fill="none" stroke="#6366f1" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-[#374151]">Ready-to-send email draft</p>
                              <p className="text-[10px] text-[#9ca3af] font-mono truncate">To: {takedown.contact_email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 py-3 border-b border-[#f0ede8] bg-white">
                          <p className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-widest mb-1">Subject</p>
                          <p className="text-[13px] text-[#0a0a0a] font-medium">
                            Urgent Content Removal Request – {domain}
                          </p>
                        </div>

                        <pre className="px-5 py-4 text-[12px] text-[#374151] leading-[1.85] whitespace-pre-wrap font-sans select-text overflow-x-auto max-h-56 overflow-y-auto bg-white">
                          {buildEmailDraft(domain, contentUrl, caseRef, fileHash)}
                        </pre>

                        <div className="px-5 py-3.5 bg-[#fafaf8] border-t border-[#f0ede8] flex flex-wrap items-center gap-2.5">
                          <button
                            onClick={() => {
                              const text = `Subject: Urgent Content Removal Request – ${domain}\n\n${buildEmailDraft(domain, contentUrl, caseRef, fileHash)}`;
                              navigator.clipboard.writeText(text).then(() => {
                                setDraftCopied(true);
                                setTimeout(() => setDraftCopied(false), 2500);
                              });
                            }}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold border border-[#e8e4de] bg-white px-4 py-2.5 rounded-lg hover:border-[#0a0a0a] transition-colors"
                          >
                            {draftCopied ? (
                              <><svg width="12" height="12" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied!</>
                            ) : (
                              <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" /></svg> Copy Email</>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const subject = `Urgent Content Removal Request – ${domain}`;
                              const body = buildEmailDraft(domain, contentUrl, caseRef, fileHash);
                              void openMailtoDraft({
                                to: takedown.contact_email!,
                                subject,
                                body,
                                clipboardTextWhenTooLong: `Subject: ${subject}\n\n${body}`,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                          >
                            Open in Email Client
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : takedown.removal_page ? (
                      /* ── Form Script Card ── */
                      <div className="rounded-xl border border-[#e8e4de] overflow-hidden shadow-sm">
                        <div className="px-5 py-3 bg-[#fafaf8] border-b border-[#f0ede8] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                              <svg width="12" height="12" fill="none" stroke="#7c3aed" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-[#374151]">Removal form script</p>
                              <a
                                href={takedown.removal_page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-indigo-600 font-mono hover:underline truncate block"
                              >
                                {takedown.removal_page}
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 py-1 border-b border-[#f0ede8] bg-white">
                          <p className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-widest py-2">Copy and paste into the form</p>
                        </div>

                        <p className="px-5 py-4 text-[12.5px] text-[#374151] leading-[1.8] select-text bg-white max-h-48 overflow-y-auto">
                          {buildFormScript(domain, contentUrl)}
                        </p>

                        <div className="px-5 py-3.5 bg-[#fafaf8] border-t border-[#f0ede8] flex flex-wrap items-center gap-2.5">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(buildFormScript(domain, contentUrl)).then(() => {
                                setScriptCopied(true);
                                setTimeout(() => setScriptCopied(false), 2500);
                              });
                            }}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold border border-[#e8e4de] bg-white px-4 py-2.5 rounded-lg hover:border-[#0a0a0a] transition-colors"
                          >
                            {scriptCopied ? (
                              <><svg width="12" height="12" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied!</>
                            ) : (
                              <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" /></svg> Copy Text</>
                            )}
                          </button>
                          <a
                            href={takedown.removal_page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                          >
                            Open Removal Form
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* ── Found but no contact details ── */
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-4">
                        <div className="flex items-start gap-2.5">
                          <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                            <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
                          </svg>
                          <p className="text-[12.5px] text-[#374151] leading-relaxed">
                            This site accepts email removal requests but we don&apos;t have the address on file.
                            Try their <span className="font-semibold">DMCA</span> or <span className="font-semibold">Contact</span> page.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["/dmca", "/contact"].map((path) => (
                            <a
                              key={path}
                              href={`https://${domain}${path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#374151] border border-[#e8e4de] bg-white px-3.5 py-2 rounded-lg hover:border-[#0a0a0a] transition-colors"
                            >
                              Try {path}
                              <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          ))}
                        </div>
                        <pre className="text-[11.5px] text-[#374151] leading-[1.8] whitespace-pre-wrap font-sans select-text overflow-x-auto bg-white border border-[#e8e4de] rounded-xl px-4 py-3 max-h-40 overflow-y-auto">
                          {buildEmailDraft(domain, contentUrl, caseRef, fileHash)}
                        </pre>
                        <button
                          onClick={() => {
                            const text = `Subject: Urgent Content Removal Request – ${domain}\n\n${buildEmailDraft(domain, contentUrl, caseRef, fileHash)}`;
                            navigator.clipboard.writeText(text).then(() => { setDraftCopied(true); setTimeout(() => setDraftCopied(false), 2500); });
                          }}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold border border-[#e8e4de] bg-white px-4 py-2.5 rounded-lg hover:border-[#0a0a0a] transition-colors"
                        >
                          {draftCopied ? (
                            <><svg width="12" height="12" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied!</>
                          ) : (
                            <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" /></svg> Copy Draft Email</>
                          )}
                        </button>
                      </div>
                    )
                  ) : hasSteps ? (
                    /* ── Static step guide for known platforms ── */
                    <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden">
                      <div className="px-5 py-3 bg-[#fafaf8] border-b border-[#f0ede8]">
                        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest">Platform-specific steps</p>
                      </div>
                      <ol className="px-5 py-4 space-y-3">
                        {steps!.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#f0ede8] flex items-center justify-center font-mono text-[10px] text-[#6b7280] font-bold shrink-0 mt-0.5">{i + 1}</span>
                            <span className="text-[12.5px] text-[#374151] leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mx-5 mb-4 text-[11px] text-[#9ca3af] border-t border-[#f0ede8] pt-3">
                        Visit {platform}&apos;s Help Center → Safety &amp; Privacy → Report Content for the official reporting form.
                      </p>
                    </div>
                  ) : domain ? (
                    /* ── No data found ── */
                    <div className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-5 py-4 flex items-start gap-3">
                      <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-[12.5px] text-[#6b7280] leading-relaxed">
                        No removal data found for <span className="font-mono text-[#374151]">{domain}</span>. Search their Help Center or Legal page manually.
                      </p>
                    </div>
                  ) : null}

                  {intelligence?.found && intelligence.network && (
                    <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="12" height="12" fill="none" stroke="#4f46e5" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                      <p className="text-[12px] text-indigo-800 leading-relaxed">
                        <span className="font-semibold">{intelligence.network}</span> operates the infrastructure behind {domain}. Filing directly with the network operator often gets faster results.
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-10 pt-2 flex items-center gap-3">
                  <button type="button" onClick={() => setActiveStep(1)} className="text-[12px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors">
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0a0a0a] text-white text-[12px] font-semibold hover:bg-[#1a1a1a] transition-colors"
                  >
                    Escalation options
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Escalation ── */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <StepBadge num={3} active />
                  <div>
                    <p className="text-[14px] font-semibold text-[#0a0a0a] mb-0.5">No response within 48 hours?</p>
                    <p className="text-[12px] text-[#6b7280]">
                      Escalate through these channels if the platform does not respond.
                    </p>
                  </div>
                </div>

                <div className="ml-10 space-y-2">
                  {[
                    { icon: "🔍", text: "Escalate to their domain registrar — find it on whois.domaintools.com" },
                    { icon: "📄", text: "File a formal complaint at DMCA.com for third-party enforcement" },
                    { icon: "🖥", text: "Report to the hosting provider's abuse team directly" },
                    { icon: "🏛", text: "In India: file at cybercrime.gov.in under the IT Act" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#e8e4de] bg-[#fafaf8]">
                      <span className="text-[14px] shrink-0 mt-0.5">{item.icon}</span>
                      <span className="text-[12.5px] text-[#374151] leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="ml-10 pt-2">
                  <button type="button" onClick={() => setActiveStep(2)} className="text-[12px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors">
                    ← Back to removal request
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Bottom bar ── */}
        <div className="border-t border-[#f0ede8] px-6 py-3 bg-[#fafaf8] flex items-center justify-between">
          <p className="text-[10.5px] text-[#9ca3af]">
            Include this report&apos;s Case ID and SHA-256 hash as supporting evidence in all correspondence.
          </p>
          {takedown?.found && (
            <div className="h-1 w-24 rounded-full bg-[#e8e4de] overflow-hidden shrink-0 ml-4">
              <div className="h-full bg-indigo-400 rounded-full transition-all duration-700" style={{ width: `${Math.round(takedown.confidence * 100)}%` }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
