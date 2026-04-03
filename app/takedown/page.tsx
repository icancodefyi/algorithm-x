"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { openMailtoDraft, splitSubjectLineDraft } from "@/lib/mailto";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const CYBERCRIME_EMAIL = "hello@cybercrime.gov.in";

const PLATFORMS = ["Instagram", "Facebook", "X / Twitter", "WhatsApp", "Telegram", "Other"];
const TAKEDOWN_STATUS_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  verified: {
    label: "Verified",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  partial: {
    label: "Partial",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  unverified: {
    label: "Unverified",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  scraped: {
    label: "Live Scan",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  not_found: {
    label: "No Route",
    badge: "border-stone-200 bg-stone-50 text-stone-600",
    dot: "bg-stone-400",
  },
};

interface RegistryTakedownResult {
  file_hash: string;
  registry_match: boolean;
  reference_id: string | null;
  registered_at: number | null;
  platform: string;
  report_url: string;
  notice_text: string;
  generated_at: number;
}

interface DomainTakedownResult {
  domain: string;
  found: boolean;
  removal_type: string | null;
  removal_page: string | null;
  contact_email: string | null;
  status: string;
  confidence: number;
  source: string;
}

interface DomainIntelligenceResult {
  domain: string;
  found: boolean;
  cdn_provider: string | null;
  provider_type: string | null;
  network: string | null;
  confidence: number;
  source: string;
}

interface DiscoveryTraceResult {
  direct_matches: Array<{
    domain: string;
    page_url: string;
    network?: string | null;
  }>;
}

interface BulkTarget {
  domain: string;
  network?: string | null;
  pageUrls: string[];
}

interface BulkGuidanceEntry {
  intel: DomainIntelligenceResult | null;
  takedown: DomainTakedownResult | null;
}

interface CaseSummary {
  case_id: string;
  created_at: number;
  anonymous: boolean;
  platform_source: string;
  issue_type: string;
  description?: string | null;
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildCaseRef(caseId: string) {
  const parts = caseId.split("-");
  if (parts.length >= 3) {
    return `SNF-${parts[0].slice(0, 4).toUpperCase()}-${parts[1].slice(0, 4).toUpperCase()}-${parts[2].slice(0, 4).toUpperCase()}`;
  }
  const compact = caseId.replace(/-/g, "").toUpperCase();
  return `SNF-${compact.slice(0, 4)}-${compact.slice(4, 8)}-${compact.slice(8, 12)}`;
}

function pushUnique(values: string[], value?: string | null) {
  if (!value) return;
  if (!values.includes(value)) {
    values.push(value);
  }
}

function buildBulkTargets(trace: DiscoveryTraceResult | null): BulkTarget[] {
  if (!trace) return [];

  const grouped = new Map<string, BulkTarget>();

  for (const match of trace.direct_matches) {
    const existing = grouped.get(match.domain);
    if (!existing) {
      grouped.set(match.domain, {
        domain: match.domain,
        network: match.network,
        pageUrls: match.page_url ? [match.page_url] : [],
      });
      continue;
    }

    existing.network = existing.network ?? match.network;
    pushUnique(existing.pageUrls, match.page_url);
  }

  return Array.from(grouped.values()).sort((a, b) => a.domain.localeCompare(b.domain));
}

function buildGuidedNotice(params: {
  domain: string;
  caseId?: string | null;
  network?: string | null;
  removalType?: string | null;
  contentUrl?: string;
}) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const caseLine = params.caseId ? `Case Reference: ${buildCaseRef(params.caseId)}\n` : "";
  const networkLine = params.network ? `Hosting Network: ${params.network}\n` : "";
  const routeLine = params.removalType ? `Preferred Route: ${params.removalType.replace(/_/g, " ")}\n` : "";
  const contentLine = params.contentUrl?.trim() ? `Content URL: ${params.contentUrl.trim()}\n` : "";

  return `Subject: Urgent removal request for non-consensual content on ${params.domain}\n\nDear Trust & Safety Team,\n\nI am requesting immediate removal of non-consensual intimate content hosted on ${params.domain}.\n\n${caseLine}${networkLine}${routeLine}${contentLine}\nThis content violates privacy and consent, and I request removal of all copies, previews, and cached variants.\n\nPlease confirm action within 48 hours.\n\nRegards,\n[Your Name]\n${date}`;
}

function formatDomainLabel(value?: string | null) {
  if (!value) return "Unknown domain";
  return value.trim().toLowerCase();
}

function formatTitleCase(value?: string | null, fallback = "Unknown") {
  if (!value) return fallback;
  return value
    .replace(/_/g, " ")
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

function getTakedownStatusStyle(status?: string | null) {
  if (!status) return TAKEDOWN_STATUS_STYLES.not_found;
  return TAKEDOWN_STATUS_STYLES[status] ?? {
    label: formatTitleCase(status, "Unknown"),
    badge: "border-stone-200 bg-stone-50 text-stone-600",
    dot: "bg-stone-400",
  };
}

function PlatformLogo({ domain, size = 68 }: { domain?: string | null; size?: number }) {
  const normalizedDomain = formatDomainLabel(domain);
  const [logoMissing, setLogoMissing] = useState(false);

  if (!domain || logoMissing) {
    return (
      <div
        className="flex items-center justify-center rounded-[22px] border border-white/70 bg-white/80 text-[#0a0a0a] shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
        style={{ width: size, height: size }}
      >
        <span className="font-mono text-[15px] uppercase tracking-[0.24em] text-[#6b7280]">
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
      className="rounded-[22px] border border-white/70 bg-white/90 object-contain p-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
    />
  );
}

function TakedownPageInner() {
  const searchParams = useSearchParams();
  const caseIdFromQuery = searchParams.get("caseId")?.trim() || null;
  const domainFromQuery = searchParams.get("domain")?.trim() || null;
  const isGuidedFlow = Boolean(domainFromQuery);
  const isBulkFlow = Boolean(caseIdFromQuery && !domainFromQuery);

  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);
  const [domainTakedown, setDomainTakedown] = useState<DomainTakedownResult | null>(null);
  const [domainIntel, setDomainIntel] = useState<DomainIntelligenceResult | null>(null);
  const [bulkTrace, setBulkTrace] = useState<DiscoveryTraceResult | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkLookupLoading, setBulkLookupLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkGuidance, setBulkGuidance] = useState<Record<string, BulkGuidanceEntry>>({});
  const [caseSummary, setCaseSummary] = useState<CaseSummary | null>(null);
  const [contentUrl, setContentUrl] = useState("");
  const [autoDetectedUrls, setAutoDetectedUrls] = useState<string[]>([]);
  const [guidedCopied, setGuidedCopied] = useState(false);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [cybercrimeCopied, setCybercrimeCopied] = useState(false);
  const [bulkDownloaded, setBulkDownloaded] = useState(false);
  const [origin, setOrigin] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [platform, setPlatform] = useState("Instagram");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegistryTakedownResult | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!isGuidedFlow || !domainFromQuery) return;
    const domain = domainFromQuery;

    let cancelled = false;

    async function loadGuidance() {
      setGuidanceLoading(true);
      setGuidanceError(null);
      setDomainTakedown(null);
      setDomainIntel(null);

      const [takedownRes, intelRes] = await Promise.allSettled([
        fetch(`/api/takedown/${encodeURIComponent(domain)}`),
        fetch(`/api/intelligence/${encodeURIComponent(domain)}`),
      ]);

      if (cancelled) return;

      let hasAny = false;

      if (takedownRes.status === "fulfilled" && takedownRes.value.ok) {
        setDomainTakedown((await takedownRes.value.json()) as DomainTakedownResult);
        hasAny = true;
      }

      if (intelRes.status === "fulfilled" && intelRes.value.ok) {
        setDomainIntel((await intelRes.value.json()) as DomainIntelligenceResult);
        hasAny = true;
      }

      if (!hasAny) {
        setGuidanceError("Could not load platform guidance for this domain. You can still use the manual notice below.");
      }

      setGuidanceLoading(false);
    }

    void loadGuidance();

    return () => {
      cancelled = true;
    };
  }, [domainFromQuery, isGuidedFlow]);

  useEffect(() => {
    if (!isGuidedFlow || !caseIdFromQuery || !domainFromQuery) return;
    const caseId = caseIdFromQuery;
    const domain = domainFromQuery;

    let cancelled = false;

    async function attachMatchedUrl() {
      try {
        const res = await fetch(`${API_URL}/api/analysis/${encodeURIComponent(caseId)}/discover`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const trace = (await res.json()) as DiscoveryTraceResult;
        const urls = trace.direct_matches
          .filter((m) => m.domain.toLowerCase() === domain.toLowerCase())
          .map((m) => m.page_url)
          .filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);

        if (cancelled || urls.length === 0) return;
        setAutoDetectedUrls(urls);
        setContentUrl((prev) => (prev.trim() ? prev : urls[0]));
      } catch {
        // Non-blocking: guided flow still works without auto-detected URL.
      }
    }

    void attachMatchedUrl();

    return () => {
      cancelled = true;
    };
  }, [caseIdFromQuery, domainFromQuery, isGuidedFlow]);

  useEffect(() => {
    if (!isBulkFlow || !caseIdFromQuery) return;
    const caseId = caseIdFromQuery;

    let cancelled = false;

    async function loadBulkTrace() {
      setBulkLoading(true);
      setBulkError(null);
      setBulkTrace(null);

      try {
        const res = await fetch(`${API_URL}/api/analysis/${encodeURIComponent(caseId)}/discover`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Could not load discovered domains for this case.");
        }

        const data = (await res.json()) as DiscoveryTraceResult;
        if (!cancelled) {
          setBulkTrace(data);
        }
      } catch (e) {
        if (!cancelled) {
          setBulkError(e instanceof Error ? e.message : "Could not load discovered domains for this case.");
        }
      } finally {
        if (!cancelled) {
          setBulkLoading(false);
        }
      }
    }

    void loadBulkTrace();

    return () => {
      cancelled = true;
    };
  }, [caseIdFromQuery, isBulkFlow]);

  const bulkTargets = useMemo(() => buildBulkTargets(bulkTrace), [bulkTrace]);

  useEffect(() => {
    if (!isBulkFlow || bulkTargets.length === 0) {
      setBulkGuidance({});
      return;
    }

    let cancelled = false;

    async function loadBulkGuidance() {
      setBulkLookupLoading(true);
      setBulkGuidance({});

      const entries = await Promise.all(
        bulkTargets.map(async (target) => {
          const [takedownRes, intelRes] = await Promise.allSettled([
            fetch(`/api/takedown/${encodeURIComponent(target.domain)}`),
            fetch(`/api/intelligence/${encodeURIComponent(target.domain)}`),
          ]);

          const takedown = takedownRes.status === "fulfilled" && takedownRes.value.ok
            ? (await takedownRes.value.json()) as DomainTakedownResult
            : null;

          const intel = intelRes.status === "fulfilled" && intelRes.value.ok
            ? (await intelRes.value.json()) as DomainIntelligenceResult
            : null;

          return [target.domain, { takedown, intel }] as const;
        }),
      );

      if (cancelled) return;

      setBulkGuidance(Object.fromEntries(entries));
      setBulkLookupLoading(false);
    }

    void loadBulkGuidance();

    return () => {
      cancelled = true;
    };
  }, [bulkTargets, isBulkFlow]);

  useEffect(() => {
    if (!caseIdFromQuery) return;
    const caseId = caseIdFromQuery;

    let cancelled = false;

    async function loadCaseSummary() {
      try {
        const res = await fetch(`${API_URL}/api/cases/${encodeURIComponent(caseId)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as CaseSummary;
        if (!cancelled) setCaseSummary(data);
      } catch {
        // Non-blocking for final takedown flow.
      }
    }

    void loadCaseSummary();

    return () => {
      cancelled = true;
    };
  }, [caseIdFromQuery]);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  async function submitLegacy() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("platform", platform);
      if (description.trim()) form.append("description", description.trim());

      const res = await fetch(`${API_URL}/api/registry/takedown-notice`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "Request failed");
      }
      setResult((await res.json()) as RegistryTakedownResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyLegacyNotice() {
    if (!result) return;
    navigator.clipboard.writeText(result.notice_text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const guidedNotice = useMemo(() => {
    if (!domainFromQuery) return "";
    return buildGuidedNotice({
      domain: domainFromQuery,
      caseId: caseIdFromQuery,
      network: domainIntel?.network,
      removalType: domainTakedown?.removal_type,
      contentUrl,
    });
  }, [caseIdFromQuery, contentUrl, domainFromQuery, domainIntel?.network, domainTakedown?.removal_type]);

  const cybercrimeComplaintText = useMemo(() => {
    if (!domainFromQuery) return "";

    const caseRef = caseIdFromQuery ? buildCaseRef(caseIdFromQuery) : "Not provided";
    const reportUrl = caseIdFromQuery ? `${origin || ""}/report/${caseIdFromQuery}` : "Not available";
    const createdAt = caseSummary?.created_at ? new Date(caseSummary.created_at * 1000).toLocaleString("en-GB") : "Not available";
    const issueType = caseSummary?.issue_type ?? "NCII / privacy violation";
    const platformSource = caseSummary?.platform_source ?? "Not provided";
    const reportType = caseSummary ? (caseSummary.anonymous ? "Anonymous" : "Named") : "Unknown";
    const narrative = caseSummary?.description?.trim() ? caseSummary.description.trim() : "No additional victim narrative provided in case intake.";
    const detectedUrls = autoDetectedUrls.length > 0
      ? autoDetectedUrls.map((u) => `- ${u}`).join("\n")
      : "- Not available";

    return [
      "Dear Cybercrime Authority,",
      "",
      "I am filing an urgent NCII cybercrime complaint with machine-generated evidence from Sniffer.",
      "",
      "Case Details:",
      `Case ID: ${caseIdFromQuery ?? "Not provided"}`,
      `Case Reference: ${caseRef}`,
      `Filed At: ${createdAt}`,
      `Report Type: ${reportType}`,
      `Issue Type: ${issueType}`,
      `Source Platform (intake): ${platformSource}`,
      "",
      "Victim Narrative:",
      narrative,
      "",
      "Technical Evidence Summary:",
      `Target Domain: ${domainFromQuery}`,
      `Hosting Network: ${domainIntel?.network ?? "Unknown"}`,
      `CDN Provider: ${domainIntel?.cdn_provider ?? "Unknown"}`,
      `Removal Method: ${domainTakedown?.removal_type?.replace(/_/g, " ") ?? "Manual submission"}`,
      `Platform Contact Email: ${domainTakedown?.contact_email ?? "Not listed"}`,
      `Platform Removal Page: ${domainTakedown?.removal_page ?? "Not listed"}`,
      "",
      "Detected Matched URLs:",
      detectedUrls,
      "",
      `Primary Content URL: ${contentUrl.trim() || autoDetectedUrls[0] || "Not provided"}`,
      "",
      "Current Platform Notice Draft:",
      guidedNotice,
      "",
      "Evidence PDF / Report Link:",
      reportUrl,
      "(Open this report and click 'Download Report' to save PDF, then attach it to this email before sending.)",
      "",
      "Requested Actions:",
      "1. Register this as an NCII cybercrime complaint.",
      "2. Issue immediate takedown/escalation instructions to the hosting ecosystem.",
      "3. Preserve forensic and platform-side logs for investigation.",
      "4. Share complaint acknowledgment and next procedural steps.",
      "",
      "Regards,",
      "[Your Name]",
    ].join("\n");
  }, [
    autoDetectedUrls,
    caseIdFromQuery,
    caseSummary,
    contentUrl,
    domainFromQuery,
    domainIntel?.cdn_provider,
    domainIntel?.network,
    domainTakedown?.contact_email,
    domainTakedown?.removal_page,
    domainTakedown?.removal_type,
    guidedNotice,
    origin,
  ]);

  const cybercrimeSubject = useMemo(() => {
    if (!domainFromQuery) return "Cybercrime NCII Report";
    const caseRef = caseIdFromQuery ? buildCaseRef(caseIdFromQuery) : "Not provided";
    return `Urgent NCII Cybercrime Complaint - ${caseRef} - ${domainFromQuery}`;
  }, [caseIdFromQuery, domainFromQuery]);

  const cybercrimeGmailHref = useMemo(() => {
    if (!domainFromQuery) return "";
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CYBERCRIME_EMAIL)}&su=${encodeURIComponent(cybercrimeSubject)}&body=${encodeURIComponent(cybercrimeComplaintText)}`;
  }, [cybercrimeComplaintText, cybercrimeSubject, domainFromQuery]);

  function copyCybercrimeComplaint() {
    if (!cybercrimeComplaintText) return;
    navigator.clipboard.writeText(cybercrimeComplaintText).then(() => {
      setCybercrimeCopied(true);
      setTimeout(() => setCybercrimeCopied(false), 2500);
    });
  }

  const cybercrimePrimaryUrl = contentUrl.trim() || autoDetectedUrls[0] || "Not provided";
  const normalizedDomain = formatDomainLabel(domainFromQuery);
  const takedownStatus = getTakedownStatusStyle(domainTakedown?.status);
  const routeHeadline = domainTakedown?.removal_page || domainTakedown?.contact_email
    ? "Ready to submit"
    : "Manual escalation likely";
  const bulkNotice = useMemo(() => {
    if (!caseIdFromQuery || bulkTargets.length === 0) return "";

    const caseRef = buildCaseRef(caseIdFromQuery);
    const reportUrl = origin ? `${origin}/report/${caseIdFromQuery}` : `/report/${caseIdFromQuery}`;
    const lines: string[] = [
      `Subject: Bulk NCII takedown escalation for ${caseRef}`,
      "",
      "To the Trust & Safety / Abuse Teams,",
      "",
      `I am submitting a consolidated takedown escalation for NCII case ${caseRef}. The same harmful content was discovered across multiple domains and should be removed wherever it appears, including mirrored pages, previews, and cached assets.`,
      "",
      "Case summary:",
      `- Case reference: ${caseRef}`,
      `- Investigation type: NCII leak discovery`,
      `- Case report: ${reportUrl}`,
      `- Domains detected: ${bulkTargets.length}`,
      "",
      "Platform evidence:",
    ];

    bulkTargets.forEach((target, index) => {
      const guidance = bulkGuidance[target.domain];
      lines.push(
        "",
        `${index + 1}. Domain: ${target.domain}`,
        `   Network: ${guidance?.intel?.network ?? target.network ?? "Unknown"}`,
        `   CDN / Provider: ${guidance?.intel?.cdn_provider ?? "Unknown"}`,
        `   Removal route: ${formatTitleCase(guidance?.takedown?.removal_type, "Manual submission")}`,
        `   Abuse contact: ${guidance?.takedown?.contact_email ?? guidance?.takedown?.removal_page ?? "No contact found"}`,
      );

      if (target.pageUrls.length > 0) {
        lines.push("   Matched URLs:");
        target.pageUrls.forEach((url) => lines.push(`   - ${url}`));
      }
    });

    lines.push(
      "",
      "Requested actions:",
      "1. Remove the detected content and mirrored variants from each listed domain.",
      "2. Disable previews, cached assets, and reposts derived from the same content.",
      "3. Confirm removal or escalation status for each domain or provide the correct abuse route.",
      "",
      "This packet was prepared from a single investigation report so that all affected domains can be handled together without re-entering evidence for each platform.",
      "",
      "Regards,",
      "Case holder",
    );

    return lines.join("\n");
  }, [bulkGuidance, bulkTargets, caseIdFromQuery, origin]);

  function copyBulkNotice() {
    if (!bulkNotice) return;
    navigator.clipboard.writeText(bulkNotice).then(() => {
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 2500);
    });
  }

  function downloadBulkNotice() {
    if (!bulkNotice) return;
    const caseRef = caseIdFromQuery ? buildCaseRef(caseIdFromQuery) : "bulk";
    const blob = new Blob([bulkNotice], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `takedown-${caseRef}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBulkDownloaded(true);
    setTimeout(() => setBulkDownloaded(false), 2500);
  }

  function copyGuidedNotice() {
    if (!guidedNotice) return;
    navigator.clipboard.writeText(guidedNotice).then(() => {
      setGuidedCopied(true);
      setTimeout(() => setGuidedCopied(false), 2500);
    });
  }

  async function openGuidedEmailDraft() {
    if (!domainTakedown?.contact_email || !guidedNotice || !domainFromQuery) return;
    const { subject, body } = splitSubjectLineDraft(
      guidedNotice,
      `Urgent takedown request - ${domainFromQuery}`,
    );
    await openMailtoDraft({
      to: domainTakedown.contact_email,
      subject,
      body,
      clipboardTextWhenTooLong: guidedNotice,
    });
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="border-b border-[#e8e4de] px-6 py-4 flex items-center gap-3 bg-white sticky top-0 z-10">
        <Link href="/" className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity">
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <span className="text-[13px] text-[#9ca3af]">Step 3 · Takedown</span>
        <div className="ml-auto flex items-center gap-2">
          {caseIdFromQuery && domainFromQuery && (
            <Link
              href={`/investigate?caseId=${encodeURIComponent(caseIdFromQuery)}&domain=${encodeURIComponent(domainFromQuery)}`}
              className="text-[12px] text-[#6b7280] hover:text-[#0a0a0a] border border-[#e8e4de] px-3 py-1.5 rounded-lg transition-colors"
            >
              Back to Investigate
            </Link>
          )}
          <Link href="/start" className="text-[12px] font-medium bg-[#0a0a0a] text-white px-4 py-1.5 rounded-full hover:bg-[#1a1a1a] transition-colors">
            New Investigation
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <svg width="16" height="16" fill="none" stroke="#4f46e5" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest">Step 3 · Takedown</p>
          </div>
          <h1 className="text-[26px] font-bold text-[#0a0a0a] tracking-tight mb-3">
            Final Takedown Action
          </h1>
          <p className="text-[13.5px] text-[#6b7280] leading-relaxed max-w-prose">
            {isGuidedFlow
              ? "This final step uses the target domain from Investigate. Review the resolved contact route, copy your notice, and submit it."
              : isBulkFlow
                ? "This case-wide workspace keeps every discovered platform together. Use bulk copy for the whole case, or drop into an individual domain when a platform needs its own form or email."
              : "Standalone mode: upload an image and generate a general takedown notice from registry and platform signals."
            }
          </p>
          {(caseIdFromQuery || domainFromQuery) && (
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <p className="text-[11.5px] font-mono text-indigo-700 uppercase tracking-widest mb-1">Case context</p>
              <p className="text-[12.5px] text-indigo-900 leading-relaxed">
                {caseIdFromQuery ? `Case ID: ${caseIdFromQuery}` : "Direct takedown flow"}
                {domainFromQuery ? ` · Domain: ${domainFromQuery}` : ""}
              </p>
            </div>
          )}
        </div>

        {isGuidedFlow ? (
          <div className="space-y-5">
            {autoDetectedUrls.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-[11.5px] font-mono text-emerald-700 uppercase tracking-widest mb-1">Detected matched page</p>
                <a
                  href={autoDetectedUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12.5px] text-emerald-800 hover:underline break-all"
                >
                  {autoDetectedUrls[0]}
                </a>
                {autoDetectedUrls.length > 1 && (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    +{autoDetectedUrls.length - 1} more matched page URL(s) found for this domain.
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-2">Optional: specific content URL</p>
              <input
                type="text"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="Paste specific page URL to strengthen notice (optional)"
                className="w-full rounded-xl border border-[#e8e4de] bg-white px-4 py-3 text-[12.5px] text-[#374151] placeholder:text-[#c4bdb5] focus:outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>

            {guidanceLoading && (
              <div className="rounded-xl border border-[#e8e4de] bg-white p-5 animate-pulse space-y-3">
                <div className="h-3 w-36 bg-[#f0ede8] rounded" />
                <div className="h-3 w-56 bg-[#f0ede8] rounded" />
                <div className="h-3 w-44 bg-[#f0ede8] rounded" />
              </div>
            )}

            {guidanceError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                {guidanceError}
              </div>
            )}

            <div className="overflow-hidden rounded-lg border border-[#e8e4de] bg-white">
              <div className="border-b border-[#e8e4de] px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-[0.22em]">Hosting Details</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.22em] border-[#e8e4de] bg-[#fafaf8] text-[#6b7280]`}>
                    <span className="h-1 w-1 rounded-full bg-[#6b7280]" />
                    {takedownStatus.label}
                  </span>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <PlatformLogo domain={normalizedDomain} size={56} />
                    <div className="min-w-0">
                      <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Target Domain</p>
                      <h2 className="break-all text-[20px] font-semibold text-[#0a0a0a] sm:text-[24px]">
                        {normalizedDomain}
                      </h2>
                      <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-[#6b7280]">
                        {routeHeadline}. Takedown path and contact resolved.
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-45 grid-cols-2 gap-2 sm:grid-cols-1 sm:justify-items-end">
                    <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-3">
                      <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Source</p>
                      <p className="mt-1 text-[12px] font-medium text-[#0a0a0a]">{formatTitleCase(domainTakedown?.source, "Dataset")}</p>
                    </div>
                    <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-3">
                      <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Confidence</p>
                      <p className="mt-1 text-[12px] font-medium text-[#0a0a0a]">{Math.round((domainTakedown?.confidence ?? 0) * 100)}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                    <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Hosting Network</p>
                    <p className="mt-1 text-[13px] font-medium text-[#0a0a0a]">{domainIntel?.network ?? "Unknown"}</p>
                  </div>
                  <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                    <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">CDN / Provider</p>
                    <p className="mt-1 text-[13px] font-medium text-[#0a0a0a]">{domainIntel?.cdn_provider ?? "Unknown"}</p>
                  </div>
                  <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                    <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Removal Method</p>
                    <p className="mt-1 text-[13px] font-medium text-[#0a0a0a]">{formatTitleCase(domainTakedown?.removal_type, "Manual submission")}</p>
                  </div>
                  <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                    <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Contact</p>
                    <p className="mt-1 break-all text-[12px] font-medium text-[#0a0a0a]">{domainTakedown?.contact_email ?? domainTakedown?.removal_page ?? "No contact found"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-[0.22em]">Removal Notice</p>
                <button
                  onClick={copyGuidedNotice}
                  className="flex items-center gap-1.5 text-[11px] text-[#6b7280] hover:text-[#0a0a0a] border border-[#e8e4de] px-3 py-1 rounded-lg transition-colors"
                >
                  {guidedCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="rounded-lg border border-[#e8e4de] bg-white px-4 py-3 text-[11px] text-[#374151] leading-relaxed whitespace-pre-wrap font-mono overflow-auto max-h-80">
                {guidedNotice}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              {domainTakedown?.removal_page && (
                <a
                  href={domainTakedown.removal_page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[11px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  Removal Form
                </a>
              )}

              {domainTakedown?.contact_email && (
                <button
                  type="button"
                  onClick={() => void openGuidedEmailDraft()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-4 py-2 text-[11px] font-medium text-[#0a0a0a] hover:bg-[#fafaf8] transition-colors"
                >
                  Email Draft
                </button>
              )}

              {cybercrimeGmailHref && (
                <a
                  href={cybercrimeGmailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-4 py-2 text-[11px] font-medium text-[#0a0a0a] hover:bg-[#fafaf8] transition-colors"
                >
                  Report to Authority
                </a>
              )}

              <button
                type="button"
                onClick={copyCybercrimeComplaint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-4 py-2 text-[12px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors"
              >
                {cybercrimeCopied ? "Copied Full Complaint" : "Copy Full Complaint"}
              </button>

              {!domainTakedown?.removal_page && !domainTakedown?.contact_email && domainFromQuery && (
                <>
                  <a
                    href={`https://${domainFromQuery}/dmca`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-4 py-2 text-[12px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors"
                  >
                    Try /dmca
                  </a>
                  <a
                    href={`https://${domainFromQuery}/contact`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-4 py-2 text-[12px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors"
                  >
                    Try /contact
                  </a>
                </>
              )}
            </div>

            <p className="text-[11.5px] text-[#9ca3af] leading-relaxed">
              Click "Report to Cybercrime Authority", then use "Copy Full Complaint", and attach the report PDF from <span className="font-mono">{caseIdFromQuery ? `${origin}/report/${caseIdFromQuery}` : "your case report"}</span> before sending to {CYBERCRIME_EMAIL}. Primary URL: <span className="font-mono">{cybercrimePrimaryUrl}</span>
            </p>
          </div>
        ) : isBulkFlow ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-[#e8e4de] bg-white px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Bulk Takedown</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-[#0a0a0a]">All discovered platforms in one workspace</h2>
                  <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#6b7280]">
                    Individual platform routes still matter because each domain can have a different removal form or abuse inbox. This view keeps them together so you can send one structured escalation packet first, then handle domain-specific submission where needed.
                  </p>
                </div>
                <Link
                  href={caseIdFromQuery ? `/report/${caseIdFromQuery}` : "/start"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-2 text-[12px] font-medium text-[#0a0a0a] hover:bg-white transition-colors"
                >
                  Back to report
                </Link>
              </div>
            </div>

            {bulkLoading ? (
              <div className="rounded-lg border border-[#e8e4de] bg-white p-5 animate-pulse space-y-3">
                <div className="h-3 w-40 rounded bg-[#f0ede8]" />
                <div className="h-12 w-full rounded bg-[#f0ede8]" />
                <div className="h-12 w-full rounded bg-[#f0ede8]" />
              </div>
            ) : bulkError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
                {bulkError}
              </div>
            ) : bulkTargets.length === 0 ? (
              <div className="rounded-lg border border-[#e8e4de] bg-white px-5 py-5">
                <p className="text-[13px] font-medium text-[#0a0a0a]">No discovered platforms available yet</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">
                  The case does not have any direct discovery matches yet, so there is nothing to issue in bulk. Re-run the leak scan or use the individual flow once matches exist.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-[#e8e4de] bg-white overflow-hidden">
                  <div className="border-b border-[#e8e4de] px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Case-Wide Escalation Packet</p>
                        <p className="mt-1 text-[12px] text-[#6b7280]">{bulkTargets.length} platform{bulkTargets.length === 1 ? "" : "s"} · ready to send</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={downloadBulkNotice}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-1.5 text-[11px] font-medium text-[#0a0a0a] hover:bg-white transition-colors"
                        >
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
                            <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
                          </svg>
                          {bulkDownloaded ? "Saved" : "Download .txt"}
                        </button>
                        <button
                          type="button"
                          onClick={copyBulkNotice}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-1.5 text-[11px] font-medium text-[#0a0a0a] hover:bg-white transition-colors"
                        >
                          {bulkCopied ? "Copied" : "Copy"}
                        </button>
                        {caseIdFromQuery && (
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`Bulk NCII takedown escalation — ${buildCaseRef(caseIdFromQuery)}`)}&body=${encodeURIComponent(bulkNotice)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
                          >
                            Open in Gmail
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 sm:px-6 space-y-4">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                        <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Coverage</p>
                        <p className="mt-1 text-[13px] font-medium text-[#0a0a0a]">{bulkTargets.length} domains</p>
                      </div>
                      <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                        <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Matched URLs</p>
                        <p className="mt-1 text-[13px] font-medium text-[#0a0a0a]">{bulkTargets.reduce((sum, target) => sum + target.pageUrls.length, 0)} total URLs</p>
                      </div>
                      <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                        <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">Purpose</p>
                        <p className="mt-1 text-[13px] font-medium text-[#0a0a0a]">One submission packet</p>
                      </div>
                    </div>
                    {bulkLookupLoading && (
                      <p className="text-[11px] text-[#9ca3af]">Resolving platform routes for all detected domains…</p>
                    )}
                    <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-3">
                      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af]">How to use this</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">
                        Copy this packet for the first escalation pass. Then use the individual platform cards below when a site needs its own portal submission or domain-specific email draft.
                      </p>
                    </div>
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-4 py-4 font-mono text-[11.5px] leading-relaxed text-[#374151]">
                      {bulkNotice}
                    </pre>
                  </div>
                </div>

                <div className="space-y-3">
                  {bulkTargets.map((target) => {
                    const guidance = bulkGuidance[target.domain];

                    return (
                      <div key={target.domain} className="rounded-lg border border-[#e8e4de] bg-white overflow-hidden">
                        {/* Card header: logo + domain + actions */}
                        <div className="flex flex-col gap-4 border-b border-[#e8e4de] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <PlatformLogo domain={target.domain} size={44} />
                            <div className="min-w-0">
                              <p className="text-[15px] font-semibold text-[#0a0a0a] break-all">{target.domain}</p>
                              <span className="inline-flex items-center rounded-full border border-[#e8e4de] bg-[#fafaf8] px-2 py-0.5 text-[10px] font-mono text-[#6b7280] mt-1">
                                {target.pageUrls.length} matched URL{target.pageUrls.length === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <Link
                              href={`/investigate?caseId=${encodeURIComponent(caseIdFromQuery ?? "")}&domain=${encodeURIComponent(target.domain)}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3.5 py-2 text-[12px] font-medium text-[#374151] transition-colors hover:border-[#0a0a0a]"
                            >
                              Investigate
                            </Link>
                            <Link
                              href={`/takedown?caseId=${encodeURIComponent(caseIdFromQuery ?? "")}&domain=${encodeURIComponent(target.domain)}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#1a1a1a]"
                            >
                              Individual takedown
                            </Link>
                            {guidance?.takedown?.removal_page && (
                              <a
                                href={guidance.takedown.removal_page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3.5 py-2 text-[12px] font-medium text-[#0a0a0a] hover:bg-white transition-colors"
                              >
                                Open portal
                              </a>
                            )}
                          </div>
                        </div>
                        {/* Card body: metadata tiles + URL list */}
                        <div className="px-5 py-4 space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-2.5">
                              <p className="text-[9px] font-mono text-[#9ca3af] uppercase tracking-widest">Network</p>
                              <p className="mt-1 text-[12px] font-medium text-[#0a0a0a] truncate">{guidance?.intel?.network ?? target.network ?? "—"}</p>
                            </div>
                            <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-2.5">
                              <p className="text-[9px] font-mono text-[#9ca3af] uppercase tracking-widest">Route</p>
                              <p className="mt-1 text-[12px] font-medium text-[#0a0a0a] truncate">{guidance?.takedown?.removal_type ?? "—"}</p>
                            </div>
                            <div className="rounded-lg border border-[#e8e4de] bg-[#fafaf8] px-3 py-2.5">
                              <p className="text-[9px] font-mono text-[#9ca3af] uppercase tracking-widest">Contact</p>
                              <p className="mt-1 text-[12px] font-medium text-[#0a0a0a] truncate">{guidance?.takedown?.contact_email ?? "—"}</p>
                            </div>
                          </div>
                          {target.pageUrls.length > 0 && (
                            <div className="space-y-1">
                              {target.pageUrls.slice(0, 3).map((url) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded-md border border-[#e8e4de] bg-[#fafaf8] px-3 py-1.5 text-[11px] font-mono text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
                                >
                                  <span className="text-[#9ca3af] shrink-0">↗</span>
                                  <span className="truncate">{url}</span>
                                </a>
                              ))}
                              {target.pageUrls.length > 3 && (
                                <p className="pl-2 text-[10px] font-mono text-[#9ca3af]">+{target.pageUrls.length - 3} more URLs in individual workspace</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : !result ? (
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-2">Image Found Online</p>
              {file && preview ? (
                <div className="flex gap-4 items-start rounded-xl border border-[#e8e4de] bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={file.name} className="w-20 h-20 object-cover rounded-lg border border-[#e8e4de] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0a0a0a] truncate">{file.name}</p>
                    <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{(file.size / 1024).toFixed(0)} KB · {file.type.split("/")[1].toUpperCase()}</p>
                    <button onClick={clearFile} className="mt-2 text-[11px] text-red-500 hover:text-red-700 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => inputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                    dragging ? "border-indigo-400 bg-indigo-50" : "border-[#d4cfc9] bg-white hover:border-[#0a0a0a] hover:bg-[#fafaf8]"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#f0efe9] border border-[#e8e4de] flex items-center justify-center mb-3">
                      <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
                        <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-medium text-[#374151] mb-1">Drop the infringing image here</p>
                    <p className="text-[11.5px] text-[#9ca3af]">JPG, PNG, WEBP · up to 10 MB · click to browse</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-2">Platform Where Found</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-all ${
                      platform === p
                        ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                        : "bg-white text-[#374151] border-[#e8e4de] hover:border-[#0a0a0a]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-2">Additional Context</p>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Where did you find it? What harm does it cause? Any other relevant details..."
                className="w-full rounded-xl border border-[#e8e4de] bg-white px-4 py-3 text-[12.5px] text-[#374151] placeholder:text-[#c4bdb5] resize-none focus:outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>

            {error && <p className="text-[12px] text-red-600 px-1">{error}</p>}

            <button
              onClick={submitLegacy}
              disabled={!file || loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-white text-[13px] font-semibold py-3.5 rounded-full hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Generating notice..." : "Generate Takedown Notice"}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`rounded-xl border overflow-hidden ${result.registry_match ? "border-emerald-200" : "border-[#e8e4de]"}`}>
              <div className={`px-5 py-3 flex items-center gap-3 ${result.registry_match ? "bg-emerald-50 border-b border-emerald-200" : "bg-[#fafaf8] border-b border-[#e8e4de]"}`}>
                <p className="text-[12px] font-semibold text-[#374151]">{result.registry_match ? "Registry Match Found" : "No Registry Match"}</p>
                <span className="ml-auto font-mono text-[10px] text-[#9ca3af] uppercase tracking-widest">{result.registry_match ? "Ownership Confirmed" : "General Report"}</span>
              </div>
              <div className="bg-white px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1">Image Hash</p>
                  <p className="font-mono text-[10.5px] text-[#374151] break-all">{result.file_hash.slice(0, 20)}...{result.file_hash.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1">Target Platform</p>
                  <p className="text-[12.5px] text-[#0a0a0a] font-medium">{result.platform}</p>
                </div>
                {result.registry_match && result.registered_at && (
                  <div>
                    <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest mb-1">Registered At</p>
                    <p className="text-[11px] text-[#374151]">{formatDate(result.registered_at)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest">Takedown Notice</p>
                <button onClick={copyLegacyNotice} className="text-[11px] text-[#6b7280] hover:text-[#0a0a0a] border border-[#e8e4de] px-3 py-1 rounded-lg transition-colors">
                  {copied ? "Copied!" : "Copy notice"}
                </button>
              </div>
              <pre className="rounded-xl border border-[#e8e4de] bg-white px-5 py-4 text-[11.5px] text-[#374151] leading-relaxed whitespace-pre-wrap font-mono overflow-auto max-h-80">
                {result.notice_text}
              </pre>
            </div>

            <a
              href={result.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
            >
              Submit to {result.platform}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TakedownPage() {
  return (
    <Suspense>
      <TakedownPageInner />
    </Suspense>
  );
}
