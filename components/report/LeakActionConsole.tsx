"use client";

import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DiscoveryResult } from "./types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buildCaseRef } from "./utils";
import { openMailtoDraft } from "@/lib/mailto";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const FORCE_MOCK_LOOKUP = false;

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

type TargetStage = "detected" | "investigated" | "notice_ready";

interface ActionDomain {
  domain: string;
  kind: "direct_match" | "related_domain";
  network?: string | null;
  confidence?: number | null;
  pageUrls: string[];
  imageUrls: string[];
  reason?: string | null;
}

interface Props {
  caseId: string;
}

const STATUS_STYLES: Record<string, { dot: string; label: string; text: string; bg: string; border: string }> = {
  verified:   { dot: "bg-emerald-500", label: "Verified",   text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  partial:    { dot: "bg-amber-400",   label: "Partial",    text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
  unverified: { dot: "bg-orange-400",  label: "Unverified", text: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200" },
  scraped:    { dot: "bg-blue-400",    label: "Live Scan",  text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
  not_found:  { dot: "bg-[#d4cfc9]",  label: "Not Found",  text: "text-[#9ca3af]",   bg: "bg-[#fafaf8]",  border: "border-[#e8e4de]" },
};

const STAGE_STYLES: Record<TargetStage, { label: string; text: string; bg: string; border: string; icon: string }> = {
  detected:     { label: "Detected",     text: "text-slate-700",  bg: "bg-slate-50",  border: "border-slate-200",  icon: "bg-slate-400" },
  investigated: { label: "Investigated", text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   icon: "bg-blue-500" },
  notice_ready: { label: "Notice Ready", text: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200",   icon: "bg-rose-500" },
};

function buildMockLookup(domain: string): { intel: IntelligenceResult; takedown: TakedownResult } {
  const d = domain.toLowerCase();
  const mockByDomain: Record<string, { network: string; removalPage: string; contact: string }> = {
    "mydesi.ltd":    { network: "Self-hosted / private CDN", removalPage: "https://mydesi.ltd/contact",    contact: "abuse@mydesi.ltd" },
    "fsiblog.pro":   { network: "Cloudflare",                removalPage: "https://fsiblog.pro/dmca",      contact: "abuse@fsiblog.pro" },
    "viralkand.com": { network: "Cloudflare",                removalPage: "https://viralkand.com/contact", contact: "abuse@viralkand.com" },
  };
  const picked = mockByDomain[d] ?? { network: "Unknown network", removalPage: `https://${domain}/contact`, contact: `abuse@${domain}` };
  return {
    intel: { domain, found: true, cdn_provider: picked.network.includes("Cloudflare") ? "Cloudflare" : "Self or private CDN", provider_type: picked.network.includes("Cloudflare") ? "global_cdn" : "self_or_private_cdn", network: picked.network, confidence: 0.96, source: "dataset" },
    takedown: { domain, found: true, removal_type: "form", removal_page: picked.removalPage, contact_email: picked.contact, status: "verified", confidence: 0.95, source: "dataset" },
  };
}

function pushUnique(values: string[], value: string | null | undefined): void {
  if (value && !values.includes(value)) values.push(value);
}

function buildActionDomains(trace: DiscoveryResult | null): ActionDomain[] {
  if (!trace) return [];
  const byDomain = new Map<string, ActionDomain>();

  for (const match of trace.direct_matches) {
    const existing = byDomain.get(match.domain);
    if (!existing) {
      byDomain.set(match.domain, { domain: match.domain, kind: "direct_match", network: match.network, confidence: match.confidence, pageUrls: match.page_url ? [match.page_url] : [], imageUrls: match.image_url ? [match.image_url] : [] });
      continue;
    }
    existing.kind = "direct_match";
    existing.network = existing.network ?? match.network;
    existing.confidence = Math.max(existing.confidence ?? 0, match.confidence ?? 0);
    pushUnique(existing.pageUrls, match.page_url);
    pushUnique(existing.imageUrls, match.image_url);
  }

  for (const related of trace.related_domains) {
    const existing = byDomain.get(related.domain);
    if (!existing) {
      byDomain.set(related.domain, { domain: related.domain, kind: "related_domain", network: related.network, confidence: null, pageUrls: [], imageUrls: [], reason: related.reason });
      continue;
    }
    existing.network = existing.network ?? related.network;
    existing.reason = existing.reason ?? related.reason;
  }

  return Array.from(byDomain.values()).sort((a, b) => (b.confidence ?? -1) - (a.confidence ?? -1));
}

function advanceStage(current: TargetStage | undefined, next: TargetStage): TargetStage {
  const order: TargetStage[] = ["detected", "investigated", "notice_ready"];
  return order.indexOf(next) > order.indexOf(current ?? "detected") ? next : current ?? "detected";
}

function buildLeakNoticeParts(
  d: ActionDomain,
  caseRef: string,
  intel: IntelligenceResult | null,
  takedown: TakedownResult | null,
): { subject: string; body: string; displayText: string } {
  const subject = `Urgent takedown request — ${d.domain}`;
  const body = [
    "To the Trust & Safety / Abuse Team,",
    "",
    `I am reporting non-consensual intimate content on ${d.domain}. Please remove the content and any mirrored copies immediately.`,
    "",
    `Case reference: ${caseRef}`,
    `Reported domain: ${d.domain}`,
    d.pageUrls.length > 0 ? "Matched page URLs:" : null,
    ...d.pageUrls.map((u) => `  • ${u}`),
    d.imageUrls.length > 0 ? "Matched asset URLs:" : null,
    ...d.imageUrls.map((u) => `  • ${u}`),
    intel?.network ? `Network / operator: ${intel.network}` : null,
    intel?.cdn_provider ? `CDN / infrastructure: ${intel.cdn_provider}` : null,
    takedown?.removal_type ? `Preferred takedown route: ${takedown.removal_type.replace(/_/g, " ")}` : null,
    "",
    "This report was generated by Sniffer. Please confirm removal.",
    "",
    "Regards,",
    "Case holder",
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, body, displayText: `Subject: ${subject}\n\n${body}` };
}

export function LeakActionConsole({ caseId }: Props): JSX.Element {
  const [trace, setTrace] = useState<DiscoveryResult | null>(null);
  const [traceLoading, setTraceLoading] = useState(true);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [noticeDomain, setNoticeDomain] = useState<string | null>(null);
  const [targetStages, setTargetStages] = useState<Record<string, TargetStage>>({});
  const [intel, setIntel] = useState<IntelligenceResult | null>(null);
  const [takedown, setTakedown] = useState<TakedownResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [noticeCopied, setNoticeCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTraceLoading(true); setTraceError(null);
      try {
        const res = await fetch(`${API_URL}/api/analysis/${caseId}/discover`, { cache: "no-store" });
        if (!res.ok) { if (!cancelled) { setTrace(null); setTraceError("Unable to load targets."); setTraceLoading(false); } return; }
        const data = (await res.json()) as DiscoveryResult;
        if (!cancelled) { setTrace(data); setTraceLoading(false); }
      } catch { if (!cancelled) { setTrace(null); setTraceError("Unable to load targets."); setTraceLoading(false); } }
    })();
    return () => { cancelled = true; };
  }, [caseId]);

  const domains = useMemo(() => buildActionDomains(trace), [trace]);

  useEffect(() => {
    if (domains.length === 0) { setSelectedDomain(""); return; }
    if (!selectedDomain || !domains.some((d) => d.domain === selectedDomain)) setSelectedDomain(domains[0].domain);
  }, [domains, selectedDomain]);

  useEffect(() => {
    if (!selectedDomain) return;
    let cancelled = false;
    (async () => {
      setLookupLoading(true); setLookupError(null); setIntel(null); setTakedown(null);
      if (FORCE_MOCK_LOOKUP) { const m = buildMockLookup(selectedDomain); if (!cancelled) { setIntel(m.intel); setTakedown(m.takedown); setLookupLoading(false); } return; }
      const [iR, tR] = await Promise.allSettled([fetch(`/api/intelligence/${encodeURIComponent(selectedDomain)}`), fetch(`/api/takedown/${encodeURIComponent(selectedDomain)}`)]);
      if (cancelled) return;
      let any = false;
      if (iR.status === "fulfilled" && iR.value.ok) { setIntel(await iR.value.json() as IntelligenceResult); any = true; }
      if (tR.status === "fulfilled" && tR.value.ok) { setTakedown(await tR.value.json() as TakedownResult); any = true; }
      if (!any) setLookupError("Unable to load removal intelligence.");
      setLookupLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selectedDomain]);

  const activeDomain = useMemo(() => domains.find((d) => d.domain === selectedDomain) ?? null, [domains, selectedDomain]);
  const modalDomain = useMemo(() => domains.find((d) => d.domain === noticeDomain) ?? null, [domains, noticeDomain]);
  const takedownStatus = takedown?.status ? STATUS_STYLES[takedown.status] ?? STATUS_STYLES.not_found : null;
  const caseRef = buildCaseRef(caseId);

  const modalDraft = useMemo(
    () => (modalDomain ? buildLeakNoticeParts(modalDomain, caseRef, intel, takedown) : null),
    [caseRef, intel, modalDomain, takedown],
  );

  const workspaceDraft = useMemo(
    () => (activeDomain ? buildLeakNoticeParts(activeDomain, caseRef, intel, takedown) : null),
    [activeDomain, caseRef, intel, takedown],
  );

  function mark(domain: string, next: TargetStage) { setTargetStages((c) => ({ ...c, [domain]: advanceStage(c[domain], next) })); }

  return (
    <section className="mb-6 rounded-xl border border-[#e8e4de] bg-white overflow-hidden shadow-sm">

      {/* ── Console Header ── */}
      <div className="bg-[#0a0a0a] px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a29e]">Removal Console</p>
        </div>
        <span className="font-mono text-[10px] text-white/30">{domains.length} target{domains.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Description ── */}
      <div className="px-6 py-4 border-b border-[#f0ede8]">
        <p className="text-[13px] font-semibold text-[#0a0a0a] mb-0.5">Actionable investigation targets</p>
        <p className="text-[12px] text-[#6b7280] leading-relaxed">
          Investigate the infrastructure or issue a takedown notice directly from the case report.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {traceLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-[#e8e4de] bg-[#fafaf8] p-5 space-y-3">
                <div className="h-4 w-40 rounded bg-[#f0ede8]" />
                <div className="h-3 w-28 rounded bg-[#f0ede8]" />
                <div className="h-3 w-52 rounded bg-[#f0ede8]" />
              </div>
            ))}
          </div>
        ) : traceError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
            <svg width="14" height="14" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
            <p className="text-[12px] text-red-700">{traceError}</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-5 py-5 text-center">
            <p className="text-[13px] font-semibold text-[#0a0a0a] mb-1">No actionable domains detected yet</p>
            <p className="text-[12px] text-[#6b7280]">Re-run the discovery scan or upload a different sample.</p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── Domain Cards ── */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {domains.map((item) => {
                const isActive = item.domain === selectedDomain;
                const stage = targetStages[item.domain] ?? "detected";
                const ss = STAGE_STYLES[stage];

                return (
                  <article
                    key={item.domain}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                      isActive ? "border-[#0a0a0a] bg-white shadow-sm ring-1 ring-[#0a0a0a]/5" : "border-[#e8e4de] bg-[#fafaf8] hover:border-[#d4cfc9]"
                    }`}
                    onClick={() => { setSelectedDomain(item.domain); mark(item.domain, "investigated"); }}
                  >
                    {/* Card top row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-[13px] font-semibold text-[#0a0a0a] truncate">{item.domain}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-mono ${ss.bg} ${ss.border} ${ss.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ss.icon}`} />
                          {ss.label}
                        </span>
                      </div>
                    </div>

                    {/* Card meta */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#9ca3af] w-16 shrink-0">Type</span>
                        <span className={`text-[11px] font-mono ${item.kind === "direct_match" ? "text-emerald-700" : "text-indigo-700"}`}>
                          {item.kind === "direct_match" ? "Direct match" : "Related domain"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#9ca3af] w-16 shrink-0">Network</span>
                        <span className="text-[11px] text-[#374151]">{item.network ?? "Unknown"}</span>
                      </div>
                      {item.confidence != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#9ca3af] w-16 shrink-0">Confidence</span>
                          <span className="text-[11px] font-mono text-[#374151]">{item.confidence}%</span>
                        </div>
                      )}
                    </div>

                    {/* Card actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0ede8]">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDomain(item.domain); mark(item.domain, "investigated"); }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3 py-1.5 text-[11px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors"
                      >
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-2-2" /></svg>
                        Investigate
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedDomain(item.domain); setNoticeDomain(item.domain); mark(item.domain, "notice_ready"); }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Takedown
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ── Investigation Workspace ── */}
            {activeDomain && (
              <div className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden">
                <div className="border-b border-[#f0ede8] px-5 py-4 flex items-center justify-between gap-3 bg-[#fafaf8]">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af] mb-1">Investigation Workspace</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-[#0a0a0a]">{activeDomain.domain}</p>
                      <span className="font-mono text-[10px] text-[#9ca3af] bg-[#f0ede8] px-2 py-0.5 rounded-md">Case {caseRef}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setNoticeDomain(activeDomain.domain); mark(activeDomain.domain, "notice_ready"); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors shrink-0"
                  >
                    Issue Takedown
                  </button>
                </div>

                <div className="p-5">
                  {lookupLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-pulse">
                      {[0, 1].map((i) => (
                        <div key={i} className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] p-5 space-y-3">
                          <div className="h-3 w-32 rounded bg-[#f0ede8]" />
                          <div className="h-3 w-44 rounded bg-[#f0ede8]" />
                          <div className="h-3 w-36 rounded bg-[#f0ede8]" />
                        </div>
                      ))}
                    </div>
                  ) : lookupError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">{lookupError}</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Infrastructure intel */}
                      <div className="rounded-xl border border-[#e8e4de] p-4 space-y-3">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Infrastructure Intelligence</p>
                        {intel?.found ? (
                          <>
                            {[
                              ["CDN Provider", intel.cdn_provider],
                              ["Provider Type", intel.provider_type?.replace(/_/g, " ")],
                              ["Network", intel.network ?? activeDomain.network],
                            ].map(([label, val]) => (
                              <div key={label as string}>
                                <p className="text-[10px] text-[#9ca3af]">{label}</p>
                                <p className="text-[13px] font-medium text-[#0a0a0a]">{(val as string) ?? "Unknown"}</p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className="text-[12px] text-[#6b7280]">No CDN intelligence found. You can still use the takedown route.</p>
                        )}
                      </div>

                      {/* Takedown route */}
                      <div className="rounded-xl border border-[#e8e4de] p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Takedown Route</p>
                          {takedownStatus && (
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-mono ${takedownStatus.bg} ${takedownStatus.border} ${takedownStatus.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${takedownStatus.dot}`} />
                              {takedownStatus.label}
                            </span>
                          )}
                        </div>
                        {takedown?.found ? (
                          <>
                            {[
                              ["Method", takedown.removal_type?.replace(/_/g, " ")],
                              ["Contact", takedown.contact_email],
                            ].map(([label, val]) => (
                              <div key={label as string}>
                                <p className="text-[10px] text-[#9ca3af]">{label}</p>
                                <p className="text-[13px] font-medium text-[#0a0a0a] break-all">{(val as string) ?? "Not listed"}</p>
                              </div>
                            ))}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {takedown.removal_page && (
                                <a href={takedown.removal_page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-[#1a1a1a] transition-colors">
                                  Open removal portal
                                  <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </a>
                              )}
                              {takedown.contact_email && workspaceDraft && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void openMailtoDraft({
                                      to: takedown.contact_email!,
                                      subject: `Takedown request for ${activeDomain.domain} (${caseRef})`,
                                      body: workspaceDraft.body,
                                      clipboardTextWhenTooLong: workspaceDraft.displayText,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#374151] hover:border-[#0a0a0a] transition-colors"
                                >
                                  Email draft
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-[12px] text-[#6b7280]">No takedown route found. Use the takedown dialog for a manual approach.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Takedown Dialog ── */}
            <AlertDialog open={Boolean(noticeDomain)} onOpenChange={(open) => { if (!open) { setNoticeDomain(null); setNoticeCopied(false); } }}>
              <AlertDialogContent className="!max-w-2xl max-h-[90vh] overflow-hidden bg-white p-0">
                {/* Dialog header */}
                <div className="bg-[#0a0a0a] px-5 py-3.5 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a29e]">Takedown Notice</p>
                  <span className="ml-auto font-mono text-[10px] text-white/30">{caseRef}</span>
                </div>

                <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: "calc(90vh - 130px)" }}>
                  <AlertDialogHeader className="items-start gap-1 text-left">
                    <AlertDialogTitle className="text-[18px] font-bold text-[#0a0a0a]">
                      {modalDomain?.domain ?? "Selected domain"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left text-[12.5px] text-[#6b7280]">
                      Review the notice below and send it to the platform or abuse team.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {/* Two-column details */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] p-4 space-y-2.5">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Platform Details</p>
                      {[
                        ["Case ref", caseRef],
                        ["Domain", modalDomain?.domain],
                        ["Network", intel?.network ?? modalDomain?.network ?? "Unknown"],
                        ["CDN", intel?.cdn_provider ?? "Unknown"],
                        ["Route", takedown?.removal_type?.replace(/_/g, " ") ?? "Manual"],
                        ["Contact", takedown?.contact_email ?? "Not listed"],
                      ].map(([label, val]) => (
                        <div key={label as string}>
                          <p className="text-[10px] text-[#9ca3af]">{label}</p>
                          <p className="text-[12px] font-medium text-[#0a0a0a] break-all">{(val as string) ?? "—"}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-[#e8e4de] bg-white p-4 space-y-2.5">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Detected URLs</p>
                      {modalDomain && modalDomain.pageUrls.length > 0 ? (
                        <div className="space-y-1.5">
                          {modalDomain.pageUrls.map((url) => (
                            <div key={url} className="truncate rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-2 font-mono text-[10.5px] text-[#374151]" title={url}>{url}</div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#6b7280]">No page URLs captured.</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {takedown?.removal_page && (
                          <a href={takedown.removal_page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1a1a1a] transition-colors">
                            Removal portal
                            <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </a>
                        )}
                        {takedown?.contact_email && modalDomain && modalDraft && (
                          <button
                            type="button"
                            onClick={() => {
                              void openMailtoDraft({
                                to: takedown.contact_email!,
                                subject: `Takedown: ${modalDomain.domain} (${caseRef})`,
                                body: modalDraft.body,
                                clipboardTextWhenTooLong: modalDraft.displayText,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#374151] hover:border-[#0a0a0a] transition-colors"
                          >
                            Email draft
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Generated notice */}
                  <div className="rounded-xl border border-[#e8e4de] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede8] bg-[#fafaf8]">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Ready Notice</p>
                      <button
                        type="button"
                        onClick={() => {
                          const text = modalDraft?.displayText ?? "";
                          if (!text) return;
                          navigator.clipboard.writeText(text).then(() => { setNoticeCopied(true); setTimeout(() => setNoticeCopied(false), 2000); }).catch(() => {});
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3 py-1.5 text-[11px] font-medium text-[#6b7280] hover:text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors"
                      >
                        {noticeCopied ? (
                          <><svg width="10" height="10" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> Copied</>
                        ) : (
                          <><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" /></svg> Copy</>
                        )}
                      </button>
                    </div>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap bg-white px-4 py-4 font-mono text-[11px] leading-relaxed text-[#374151] select-text">
                      {modalDraft?.displayText ?? ""}
                    </pre>
                  </div>
                </div>

                {/* Dialog footer */}
                <div className="flex items-center justify-between gap-3 border-t border-[#f0ede8] bg-[#fafaf8] px-5 py-3.5">
                  <AlertDialogCancel className="rounded-lg border border-[#e8e4de] bg-white px-4 py-2 text-[12px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors">
                    Close
                  </AlertDialogCancel>
                  <div className="flex items-center gap-2">
                    {modalDomain && (
                      <Link
                        href={`/takedown?caseId=${caseId}&domain=${encodeURIComponent(modalDomain.domain)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
                      >
                        Formal notice
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </Link>
                    )}
                  </div>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </section>
  );
}
