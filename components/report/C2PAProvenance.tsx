"use client";

import Image from "next/image";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { C2paResult } from "./types";

const GEMINI_LOGO = { src: "/c2pa-logos/gemini-color.png", alt: "Google / Gemini" };
const OPENAI_LOGO = { src: "/c2pa-logos/openai.png", alt: "OpenAI" };

// Keywords that map to a logo — checked against generator_tool, issuer, and issuer_org
const LOGO_KEYWORDS: Array<{ keywords: string[]; logo: typeof GEMINI_LOGO }> = [
  { keywords: ["gemini", "google", "c2pa core generator"], logo: GEMINI_LOGO },
  { keywords: ["openai", "gpt", "dall-e", "sora", "chatgpt"], logo: OPENAI_LOGO },
];

function resolveLogo(c2pa: C2paResult | undefined) {
  if (!c2pa) return null;
  const haystack = [
    c2pa.generator_tool ?? "",
    c2pa.issuer ?? "",
    c2pa.issuer_org ?? "",
  ].join(" ").toLowerCase();

  for (const { keywords, logo } of LOGO_KEYWORDS) {
    if (keywords.some((k) => haystack.includes(k))) return logo;
  }
  return null;
}

interface Props {
  c2pa: C2paResult | undefined;
}

const STATUS_CONFIG = {
  verified: {
    label: "Verified",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    dot: "bg-emerald-500",
  },
  trust_warning: {
    label: "Verified (cert unanchored)",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-600">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    dot: "bg-amber-500",
  },
  invalid: {
    label: "Invalid — modified after signing",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-600">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    dot: "bg-red-500",
  },
  not_present: {
    label: "Not Present (Risk Signal)",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9ca3af]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="16" strokeDasharray="2 2" />
      </svg>
    ),
    dot: "bg-amber-500",
  },
} as const;

function formatSigningTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

export function C2PAProvenance({ c2pa }: Props) {
  const { t } = useTranslation();
  const status = (c2pa?.status ?? "not_present") as keyof typeof STATUS_CONFIG;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_present;
  const logo = resolveLogo(c2pa);

  return (
    <section className="mb-6">
      <div className="border border-[#e8e4de] rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Section header */}
        <div className="border-b border-[#f0ede8] px-5 py-3 flex items-center gap-2.5 bg-[#fafaf8]">
          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-[0.15em] font-semibold">{t.report.c2paCredentials}</p>
        </div>

        {/* ── Status header ── */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-[#f0ede8] bg-[#fafaf8]">
          {logo ? (
            <Image src={logo.src} alt={logo.alt} width={16} height={16} className="rounded shrink-0 object-contain" />
          ) : cfg.icon}
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
            {cfg.label}
          </span>
          {status === "trust_warning" && (
            <span className="text-[11px] text-[#9ca3af] leading-tight">
              Certificate not in CAI Trust List — structure is cryptographically intact
            </span>
          )}
          {status === "invalid" && (
            <span className="text-[11px] text-red-500 leading-tight">
              File was altered after the provenance certificate was issued
            </span>
          )}
          {status === "not_present" && (
            <span className="text-[11px] text-amber-700">
              No Content Credentials embedded. This increases uncertainty because origin cannot be cryptographically verified.
            </span>
          )}
        </div>

        {/* ── Signer + Tool grid (only when manifest present) ── */}
        {c2pa && status !== "not_present" && (
          <>
            <div className="grid grid-cols-2 divide-x divide-[#f0ede8] border-b border-[#f0ede8]">
              {c2pa.issuer && (
                <div className="px-4 py-3 min-w-0">
                  <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1">Signed by</p>
                  <div className="flex items-center gap-1.5 min-w-0">
                    {logo && (
                      <Image src={logo.src} alt={logo.alt} width={14} height={14} className="rounded shrink-0 object-contain opacity-80" />
                    )}
                    <p className="text-[12.5px] text-[#0a0a0a] font-medium truncate" title={c2pa.issuer}>
                      {c2pa.issuer}
                    </p>
                  </div>
                  {c2pa.issuer_org && c2pa.issuer_org !== c2pa.issuer && (
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">{c2pa.issuer_org}</p>
                  )}
                </div>
              )}
              {c2pa.generator_tool && (
                <div className="px-4 py-3 min-w-0">
                  <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1">Origin Tool</p>
                  <div className="flex items-center gap-2 min-w-0">
                    {logo && (
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={18}
                        height={18}
                        className="rounded shrink-0 object-contain"
                      />
                    )}
                    <p className="text-[12.5px] text-[#0a0a0a] font-medium truncate" title={c2pa.generator_tool}>
                      {c2pa.generator_tool}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {c2pa.signing_time && (
              <div className="px-4 py-3 border-b border-[#f0ede8]">
                <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1">Signed At</p>
                <p className="text-[12.5px] text-[#0a0a0a]">{formatSigningTime(c2pa.signing_time)}</p>
              </div>
            )}

            {/* ── AI-generated declaration ── */}
            {c2pa.ai_generated && (
              <div className="px-4 py-3 border-b border-[#f0ede8] bg-amber-50">
                <div className="flex items-start gap-2">
                  {logo ? (
                    <Image src={logo.src} alt={logo.alt} width={16} height={16} className="rounded shrink-0 object-contain mt-0.5" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 mt-0.5 shrink-0">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                  <div>
                    <p className="text-[12px] font-semibold text-amber-800">AI-Generated Content Declared</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      The manifest includes a{" "}
                      <span className="font-mono">trainedAlgorithmicMedia</span> assertion — the signer
                      explicitly declared this content was created by AI.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Actions provenance chain ── */}
            {c2pa.actions_summary && c2pa.actions_summary.length > 0 && (
              <div className="px-4 py-3 border-b border-[#f0ede8]">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest">
                    Provenance Actions
                  </p>
                  <div className="relative group">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c4bdb5] cursor-help">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 hidden group-hover:block z-10">
                      <div className="bg-[#1a1a1a] text-white text-[11px] leading-relaxed px-3 py-2.5 rounded-lg shadow-xl">
                        <p className="font-semibold mb-1 text-white/90">What are Provenance Actions?</p>
                        <p className="text-white/60">
                          Every step recorded by the content&apos;s creator in the C2PA manifest — from generation to export.
                          This is an unforgeable, cryptographically-signed paper trail of how the file was made and transformed.
                        </p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
                      </div>
                    </div>
                  </div>
                </div>
                <ol className="space-y-2">
                  {c2pa.actions_summary.map((action, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.75 shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-[#f0ede8] text-[9px] font-mono text-[#6b7280]">
                        {i + 1}
                      </span>
                      <span className="text-[12px] text-[#374151]">{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* ── Assertions ── */}
            {c2pa.assertions && c2pa.assertions.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-2">
                  Assertions ({c2pa.assertions.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c2pa.assertions.map((assertion, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono bg-[#f5f5f4] border border-[#e8e4de] px-2 py-0.5 rounded text-[#6b7280]"
                      title={assertion}
                    >
                      {assertion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
