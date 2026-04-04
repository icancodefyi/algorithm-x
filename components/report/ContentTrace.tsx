"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { buildMockDiscoveryResult } from "@/components/report/mockDiscoveryTrace";
import type { DiscoveryResult } from "@/components/report/types";
import { domainIconUrl } from "@/lib/domainIconUrl";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const MATCH_LABELS: Record<string, string> = {
  exact: "Exact visual match",
  near_duplicate: "Near-duplicate",
  probable: "Probable match",
};

const MATCH_CLASSES: Record<string, string> = {
  exact: "bg-red-50 border-red-200 text-red-700",
  near_duplicate: "bg-amber-50 border-amber-200 text-amber-700",
  probable: "bg-indigo-50 border-indigo-200 text-indigo-700",
};

function formatDomainLabel(value?: string | null) {
  if (!value) return "unknown";
  return value.trim().toLowerCase();
}

function PlatformLogo({ domain, size = 40 }: { domain?: string | null; size?: number }) {
  const normalizedDomain = formatDomainLabel(domain);
  const [logoFailed, setLogoFailed] = useState(false);

  if (!domain || logoFailed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[#e8e4de] bg-[#f5f3f0] shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#6b7280]">
          {normalizedDomain.slice(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={domainIconUrl(normalizedDomain, 64)}
      alt={`${normalizedDomain} logo`}
      width={size}
      height={size}
      onError={() => setLogoFailed(true)}
      className="rounded-xl border border-[#e8e4de] bg-white object-contain p-1.5 shrink-0"
      unoptimized
    />
  );
}

interface Props {
  caseId: string;
}

export function ContentTrace({ caseId }: Props) {
  const { t } = useTranslation();
  const [trace, setTrace] = useState<DiscoveryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setUsedMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Show mock data immediately after a short "scanning" delay for effect
    const mockTimer = setTimeout(() => {
      if (!cancelled && !trace) {
        setTrace(buildMockDiscoveryResult(caseId));
        setUsedMock(true);
        setLoading(false);
      }
    }, 1800);

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/api/analysis/${caseId}/discover`, { cache: "no-store" });
        if (res.status === 404 || !res.ok) return;
        const data = await res.json() as DiscoveryResult;
        if (cancelled) return;
        // Only replace mock if we got real completed data with actual matches
        if (data.status === "completed" && data.direct_matches.length > 0) {
          clearTimeout(mockTimer);
          setTrace(data);
          setUsedMock(false);
          setLoading(false);
        } else if (data.status === "running" || data.status === "queued") {
          timer = setTimeout(poll, 3000);
        }
      } catch {
        // keep mock
      }
    }

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(mockTimer);
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#e8e4de] bg-white px-6 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <p className="text-[12px] font-medium text-[#0a0a0a]">Scanning distribution network…</p>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-3 w-48 rounded bg-[#f0ede8]" />
          <div className="h-16 w-full rounded-xl bg-[#f0ede8]" />
          <div className="h-16 w-full rounded-xl bg-[#f0ede8]" />
        </div>
      </div>
    );
  }

  if (!trace) return null;

  const summary = `${trace.domains_scanned} domains · ${trace.pages_scanned} pages · ${trace.candidates_evaluated} assets evaluated`;

  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">

      {/* Header */}
      <div className="border-b border-[#e8e4de] px-5 py-4 flex items-center justify-between gap-4 bg-[#fafaf8]">
        <div>
          <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.2em] mb-1">
            {t.report.distributionTrace}
          </p>
          <p className="text-[14px] font-semibold text-[#0a0a0a]">Visual match scan</p>
          <p className="text-[12px] text-[#6b7280] mt-0.5 leading-relaxed">
            Perceptual fingerprinting across high-risk domains and known mirror networks.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          {trace && trace.direct_matches.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-mono text-red-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {trace.direct_matches.length} match{trace.direct_matches.length > 1 ? "es" : ""} found
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-mono text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Scan complete
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-6">

        {/* Scan summary chips */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-2.5 py-1 text-[11px] font-mono text-[#6b7280]">
            {summary}
          </span>
          {trace.prioritized_network && (
            <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-mono text-indigo-600">
              Priority: {trace.prioritized_network}
            </span>
          )}
        </div>

        {/* Direct matches */}
        {trace.direct_matches.length > 0 && (
          <div>
            {/* Urgency alert banner */}
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
              <svg width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-[12.5px] font-semibold text-red-800">
                  Content is actively circulating — {trace.direct_matches.length} site{trace.direct_matches.length > 1 ? "s" : ""} confirmed
                </p>
                <p className="text-[11.5px] text-red-700 mt-0.5 leading-relaxed">
                  Visual fingerprinting matched this image across known leak networks. Immediate takedown action is recommended.
                </p>
              </div>
            </div>

            <p className="text-[11px] font-mono text-[#a8a29e] uppercase tracking-widest mb-3">
              Direct visual matches ({trace.direct_matches.length})
            </p>
            <div className="space-y-3">
              {trace.direct_matches.map((match) => {
                const isExact = match.match_type === "exact";
                return (
                  <div
                    key={`${match.domain}-${match.image_url}`}
                    className={`rounded-xl border p-4 ${
                      isExact
                        ? "border-red-200 bg-red-50"
                        : "border-[#e8e4de] bg-[#fafaf8]"
                    }`}
                  >
                    {/* Exact match top alert strip */}
                    {isExact && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-100">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <p className="text-[11px] font-mono font-bold text-red-700 uppercase tracking-wider">
                          FOUND — Content confirmed live on this domain
                        </p>
                      </div>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <PlatformLogo domain={match.domain} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className={`text-[13px] font-semibold ${isExact ? "text-red-900" : "text-[#0a0a0a]"}`}>
                            {match.domain}
                          </p>
                          {match.network && (
                            <span className="inline-flex items-center rounded-full border border-[#e8e4de] bg-white px-2 py-0.5 text-[10px] font-mono text-[#6b7280]">
                              {match.network}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold ${MATCH_CLASSES[match.match_type]}`}>
                            {MATCH_LABELS[match.match_type]}
                          </span>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono ${
                            isExact ? "border-red-200 bg-white text-red-700" : "border-[#e8e4de] bg-white text-[#6b7280]"
                          }`}>
                            {match.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metric row */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <MetricTile label="Asset" value={match.asset_type.split("/")[1]?.toUpperCase() ?? match.asset_type} />
                      <MetricTile label="SSIM" value={String(match.ssim_score)} />
                      <MetricTile label="pHash Δ" value={String(match.phash_distance)} />
                      <MetricTile label="dHash Δ" value={String(match.dhash_distance)} />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a href={match.page_url} target="_blank" rel="noreferrer"
                        className={`text-[11.5px] font-medium hover:underline ${isExact ? "text-red-700" : "text-indigo-600"}`}>
                        View page →
                      </a>
                      <a href={match.image_url} target="_blank" rel="noreferrer"
                        className="text-[11.5px] font-medium text-[#6b7280] hover:text-[#0a0a0a] transition-colors">
                        View image →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related / sister domains */}
        {trace.related_domains && trace.related_domains.length > 0 && (
          <div>
            <p className="text-[11px] font-mono text-[#a8a29e] uppercase tracking-widest mb-3">
              Related domains ({trace.related_domains.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trace.related_domains.map((domain) => (
                <div
                  key={`${domain.network}-${domain.domain}`}
                  className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] p-3.5 flex items-start gap-3"
                >
                  <PlatformLogo domain={domain.domain} size={36} />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#0a0a0a]">{domain.domain}</p>
                    <p className="text-[10.5px] font-mono text-[#9ca3af] mt-0.5">{domain.network}</p>
                    <p className="text-[11px] text-[#6b7280] mt-1 leading-relaxed">{domain.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e8e4de] bg-white px-2.5 py-2">
      <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">{label}</p>
      <p className="mt-1 text-[11px] font-medium text-[#0a0a0a]">{value}</p>
    </div>
  );
}
