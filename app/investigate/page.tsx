"use client";

import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { extractDomain } from "@/lib/url";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IntelligenceResult {
  domain: string;
  found: boolean;
  cdn_provider: string | null;
  provider_type: string | null;
  network: string | null;
  confidence: number;
  source: string;
}

interface TakedownResult {
  domain: string;
  found: boolean;
  removal_type: string | null;
  removal_page: string | null;
  contact_email: string | null;
  status: string;
  confidence: number;
  source: string;
}

interface Results {
  domain: string;
  intelligence: IntelligenceResult | null;
  takedown: TakedownResult | null;
  intelligenceError?: string;
  takedownError?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { dot: string; label: string; text: string }> = {
  verified:   { dot: "bg-emerald-500", label: "Verified",   text: "text-emerald-700" },
  partial:    { dot: "bg-amber-400",   label: "Partial",    text: "text-amber-700"   },
  unverified: { dot: "bg-orange-400",  label: "Unverified", text: "text-orange-700"  },
  scraped:    { dot: "bg-blue-400",    label: "Live Scan",  text: "text-blue-700"    },
  not_found:  { dot: "bg-[#d4cfc9]",  label: "Not Found",  text: "text-[#9ca3af]"   },
};

function formatDomainLabel(value?: string | null) {
  if (!value) return "unknown";
  return value.trim().toLowerCase();
}

function formatTitleCase(value?: string | null, fallback = "Unknown") {
  if (!value) return fallback;
  return value
    .replace(/_/g, " ")
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

function PlatformLogo({ domain, size = 64 }: { domain?: string | null; size?: number }) {
  const normalizedDomain = formatDomainLabel(domain);
  const [logoMissing, setLogoMissing] = useState(false);

  if (!domain || logoMissing) {
    return (
      <div
        className="flex items-center justify-center rounded-4xl border border-white/70 bg-white/85 text-[#0a0a0a] shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
        style={{ width: size, height: size }}
      >
        <span className="font-mono text-[14px] uppercase tracking-[0.24em] text-[#6b7280]">
          {normalizedDomain.slice(0, 2) || "--"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/supported-platforms/${normalizedDomain}.webp`}
      alt={`${normalizedDomain} logo`}
      width={size}
      height={size}
      onError={() => setLogoMissing(true)}
      className="rounded-4xl border border-white/70 bg-white/90 object-contain p-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
    />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

function InvestigateContent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  // Evidence from linked Sniffer report
  const [caseRefAttached, setCaseRefAttached] = useState<string | null>(null);
  const [reportCaseId, setReportCaseId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const analyze = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const domain = extractDomain(trimmed);
    if (!domain) {
      setError("Please enter a valid URL or domain.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const [intelRes, takedownRes] = await Promise.allSettled([
      fetch(`/api/intelligence/${encodeURIComponent(domain)}`),
      fetch(`/api/takedown/${encodeURIComponent(domain)}`),
    ]);

    let intelligence: IntelligenceResult | null = null;
    let intelligenceError: string | undefined;
    let takedown: TakedownResult | null = null;
    let takedownError: string | undefined;

    if (intelRes.status === "fulfilled" && intelRes.value.ok) {
      intelligence = await intelRes.value.json();
    } else {
      intelligenceError = "Intelligence service unavailable";
    }

    if (takedownRes.status === "fulfilled" && takedownRes.value.ok) {
      takedown = await takedownRes.value.json();
    } else {
      takedownError = "Takedown service unavailable";
    }

    setResults({ domain, intelligence, takedown, intelligenceError, takedownError });
    setLoading(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    analyze(input);
  }

  // Read query params from linked report (caseId, domain)
  useEffect(() => {
    const domainParam = searchParams.get("domain");
    const caseIdParam = searchParams.get("caseId");
    if (caseIdParam) {
      setCaseRefAttached(formatCaseRef(caseIdParam));
      setReportCaseId(caseIdParam);
    }
    if (domainParam) {
      const clean = extractDomain(domainParam);
      if (clean) {
        setInput(clean);
        analyze(clean);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf8]">

      {/* Nav */}
      <header className="border-b border-[#e8e4de] px-6 py-4 flex items-center gap-3 bg-white sticky top-0 z-10">
        <Link
          href="/"
          className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity"
        >
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        {reportCaseId ? (
          <>
            <Link href={`/report/${reportCaseId}`} className="text-[13px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors">
              Report
            </Link>
            <span className="text-[#d4cfc9]">/</span>
            <span className="text-[13px] text-[#9ca3af]">Investigate</span>
          </>
        ) : (
          <span className="text-[13px] text-[#9ca3af]">Investigate</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/takedown"
            className="text-[12px] text-[#6b7280] hover:text-[#0a0a0a] border border-[#e8e4de] px-3 py-1.5 rounded-lg transition-colors"
          >
            Takedown Notice
          </Link>
          <Link
            href="/start"
            className="text-[12px] font-medium bg-[#0a0a0a] text-white px-4 py-1.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
          >
            New Investigation
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#f0ede8] border border-[#e8e4de] flex items-center justify-center">
              <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest">Step 2 · Investigate</p>
          </div>
          <h1 className="text-[26px] font-bold text-[#0a0a0a] tracking-tight mb-3">
            Investigate Target Domain
          </h1>
          <p className="text-[13.5px] text-[#6b7280] leading-relaxed max-w-prose">
            {reportCaseId
              ? "Your case evidence is attached. Use this step to identify the right platform contact and validate where to submit your request."
              : "Paste a URL or domain where your content is being shared without consent. Sniffer will map the likely platform and available contact routes."
            }
          </p>
          {/* Evidence badge when coming from a report */}
          {caseRefAttached && (
            <div className="mt-4 inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50">
              <svg width="13" height="13" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[11px] font-semibold text-emerald-800">Forensic evidence attached</p>
                <p className="font-mono text-[10px] text-emerald-600">{caseRefAttached}</p>
              </div>
            </div>
          )}
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/video/abc  or  example.com"
              className="flex-1 rounded-xl border border-[#e8e4de] bg-white px-4 py-3 text-[13px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:border-[#0a0a0a] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex items-center gap-2 bg-[#0a0a0a] text-white text-[13px] font-semibold px-5 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {loading ? "Looking up…" : "Look Up"}
            </button>
          </div>
          {error && <p className="mt-2 text-[12px] text-red-600 px-1">{error}</p>}
        </form>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-28 bg-[#e8e4de] rounded" />
            <div className="rounded-xl border border-[#e8e4de] bg-white p-5 space-y-3">
              <div className="h-3 w-40 bg-[#f0ede8] rounded" />
              <div className="h-3 w-56 bg-[#f0ede8] rounded" />
              <div className="h-3 w-32 bg-[#f0ede8] rounded" />
            </div>
            <div className="h-4 w-28 bg-[#e8e4de] rounded" />
            <div className="rounded-xl border border-[#e8e4de] bg-white p-5 space-y-3">
              <div className="h-3 w-48 bg-[#f0ede8] rounded" />
              <div className="h-3 w-64 bg-[#f0ede8] rounded" />
              <div className="h-3 w-36 bg-[#f0ede8] rounded" />
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="space-y-6">

            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[12.5px] text-indigo-900">
                  Step 2 reviewed for <span className="font-semibold">{results.domain}</span>. Continue to Step 3 for final takedown action.
                </p>
                {results.takedownError && (
                  <p className="text-[11.5px] text-indigo-700 mt-1">
                    Takedown provider is currently unavailable from this step. Step 3 will open manual domain-specific notice mode.
                  </p>
                )}
              </div>
              <Link
                href={reportCaseId
                  ? `/takedown?caseId=${encodeURIComponent(reportCaseId)}&domain=${encodeURIComponent(results.domain)}`
                  : `/takedown?domain=${encodeURIComponent(results.domain)}`
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3.5 py-2 text-[12px] font-medium text-white hover:bg-indigo-800 transition-colors"
              >
                Continue to Step 3
              </Link>
            </div>

            {/* Domain badge */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] shrink-0" />
              <span className="font-mono text-[11px] text-[#374151] tracking-wide">{results.domain}</span>
            </div>

            {/* ── Platform Intelligence ──────────────────────────────────── */}
            <section>
              <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-2">
                Hosting Intelligence
              </p>

              {results.intelligenceError ? (
                <ServiceError message={results.intelligenceError} />
              ) : results.intelligence?.found ? (
                <div className="rounded-lg border border-[#e8e4de] bg-white">
                  <div className="px-5 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <PlatformLogo domain={results.domain} size={56} />
                        <div className="min-w-0">
                          <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Infrastructure</p>
                          <h2 className="text-[18px] font-semibold text-[#0a0a0a] sm:text-[20px]">Leak network mapped</h2>
                          <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-[#6b7280]">
                            Hosting details for <span className="font-medium">{results.domain}</span>.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                        {results.intelligence.cdn_provider && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#e8e4de] bg-[#fafaf8] px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.22em] text-[#6b7280]">
                            CDN detected
                          </span>
                        )}
                        {results.intelligence.network && (
                          <NetworkBadge network={results.intelligence.network} />
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <InsightTile
                        label="Domain"
                        value={results.domain}
                      />
                      <InsightTile
                        label="CDN"
                        value={results.intelligence.cdn_provider ?? "Unknown"}
                      />
                      <InsightTile
                        label="Type"
                        value={formatTitleCase(results.intelligence.provider_type, "Unknown")}
                      />
                      <InsightTile
                        label="Source"
                        value={results.intelligence.source === "scraped" ? "Live scan" : "Dataset"}
                      />
                    </div>

                    {results.intelligence.network && results.intelligence.network !== "Unknown" && (
                      <div className="mt-5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Network escalation</p>
                        <p className="mt-2 text-[12px] leading-relaxed text-[#6b7280]">
                          <span className="font-medium">{results.intelligence.network}</span> operates this infrastructure.
                        </p>
                      </div>
                    )}
                  </div>
                  <ConfidenceBar value={results.intelligence.confidence} />
                </div>
              ) : (
                <NotFoundCard
                  message="Domain not found in intelligence database."
                  hint="Try the takedown lookup below."
                />
              )}
            </section>

            {/* ── Takedown Guidance ─────────────────────────────────────── */}
            <section>
              <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-2">
                Takedown Guidance
              </p>

              {results.takedownError ? (
                <ServiceError message={results.takedownError} />
              ) : results.takedown?.found ? (
                <div className="overflow-hidden rounded-lg border border-[#e8e4de] bg-white">
                  <div className="px-5 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <PlatformLogo domain={results.domain} size={56} />
                        <div className="min-w-0">
                          <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Takedown Removal</p>
                          <h2 className="text-[18px] font-semibold text-[#0a0a0a] sm:text-[20px]">Resolved removal route</h2>
                          <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-[#6b7280]">
                            Takedown path for <span className="font-medium">{results.domain}</span>.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                        <StatusBadge status={results.takedown.status} />
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#e8e4de] bg-[#fafaf8] px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.22em] text-[#6b7280]">
                          {results.takedown.source === "scraped" ? "Live scan" : "Dataset"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <InsightTile
                        label="Domain"
                        value={results.domain}
                      />
                      <InsightTile
                        label="Method"
                        value={formatTitleCase(results.takedown.removal_type, "Unknown")}
                      />
                      <InsightTile
                        label="Email"
                        value={results.takedown.contact_email ? "Available" : "Not listed"}
                      />
                      <InsightTile
                        label="Form"
                        value={results.takedown.removal_page ? "Available" : "Not found"}
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {results.takedown.removal_page && (
                        <a
                          href={results.takedown.removal_page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[11px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
                        >
                          Removal Form
                        </a>
                      )}
                      {caseRefAttached && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-2 text-[11px] text-[#6b7280]">
                          Case: {caseRefAttached}
                        </span>
                      )}
                    </div>
                  </div>
                  <ConfidenceBar value={results.takedown.confidence} color="indigo" />
                </div>
              ) : (
                <NotFoundCard
                  message="No removal information found."
                  hint="Try filing directly with domain registrar."
                />
              )}
            </section>

            {/* Divider + re-analyze */}
            <div className="border-t border-[#e8e4de] pt-5 flex items-center justify-between">
              <p className="text-[11.5px] text-[#9ca3af]">
                Results are based on a continuously updated dataset.
              </p>
              <button
                onClick={() => { setResults(null); setInput(""); setCaseRefAttached(null); setReportCaseId(null); inputRef.current?.focus(); }}
                className="text-[12px] text-indigo-600 hover:underline"
              >
                Look up another domain
              </button>
            </div>

          </div>
        )}

        {/* Empty state — first load */}
        {!results && !loading && (
          <div className="border border-dashed border-[#e8e4de] rounded-xl p-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#f0ede8] border border-[#e8e4de] flex items-center justify-center mx-auto mb-4">
              <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-[#374151] mb-1.5">
              Paste the URL where your content appears
            </p>
            <p className="text-[12px] text-[#9ca3af] max-w-xs mx-auto">
              Sniffer will map infrastructure and route metadata so you can continue to Step 3 for final takedown action.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

// ── Template helpers ─────────────────────────────────────────────────────────

function formatCaseRef(caseId: string): string {
  return `SNF-${caseId.slice(0, 4).toUpperCase()}-${caseId.slice(4, 8).toUpperCase()}-${caseId.slice(9, 13).toUpperCase()}`;
}

export default function InvestigatePage() {
  return (
    <Suspense>
      <InvestigateContent />
    </Suspense>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-0.5">
        {label}
      </dt>
      <dd className="text-[12.5px] text-[#374151] font-medium capitalize">
        {value ?? <span className="text-[#c4bdb5] font-normal">—</span>}
      </dd>
    </div>
  );
}

function InsightTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-3">
      <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">{label}</p>
      <p className="mt-1 break-all text-[12px] font-medium text-[#0a0a0a]">{value}</p>
    </div>
  );
}

function NetworkBadge({ network }: { network: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#e8e4de] bg-[#fafaf8] font-mono text-[9px] text-[#6b7280] shrink-0">
      {network}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.not_found;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#e8e4de] bg-[#fafaf8] font-mono text-[10.5px] ${s.text} shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ConfidenceBar({
  value,
  color = "neutral",
}: {
  value: number;
  color?: "neutral" | "indigo";
}) {
  const pct = Math.round(value * 100);
  const fill = color === "indigo" ? "bg-indigo-400" : "bg-[#0a0a0a]";
  return (
    <div className="h-0.75 bg-[#f0ede8]">
      <div
        className={`h-full ${fill} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function NotFoundCard({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="border border-[#e8e4de] rounded-xl bg-white px-5 py-5">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full border border-[#e8e4de] bg-[#fafaf8] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[10px] text-[#9ca3af]">—</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#374151] mb-1">{message}</p>
          <p className="text-[12px] text-[#9ca3af] leading-relaxed">{hint}</p>
        </div>
      </div>
    </div>
  );
}

function ServiceError({ message }: { message: string }) {
  return (
    <div className="border border-red-100 rounded-xl bg-red-50 px-5 py-4">
      <p className="text-[12.5px] text-red-600">{message}</p>
    </div>
  );
}
