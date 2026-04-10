import type { PhishingSignal, PhishingVerdict, SpearPhishingAnalysis } from "@/types/spear-phishing";
import type { SecurityAlertSeverity } from "@/types/security-platform";

const URGENCY = /\b(urgent|immediately|within\s+\d+\s*(hour|hr|minute)|act\s+now|expires?\s+today|last\s+chance|do\s+not\s+ignore|time-?sensitive)\b/i;
const FINANCIAL = /\b(wire\s+transfer|invoice|payment\s+due|gift\s+card|cryptocurrency|bitcoin|refund\s+pending|overdue|pay\s+now|ACH|sort\s+code)\b/i;
const EXEC_IMPERSONATION =
  /\b(CEO|CFO|COO|president|director|executive|head\s+of\s+\w+|founder)\b.*\b(request|ask|need|authorize)\b|\b(dear\s+)?(team|staff|employee)\b.*\b(wire|transfer|gift)\b/i;
const CREDENTIAL = /\b(verify\s+your\s+account|confirm\s+your\s+identity|reset\s+password|click\s+here\s+to\s+log|mfa\s+code|one-?time\s+passcode|suspended\s+account)\b/i;
const SENSITIVE = /\b(SSN|social\s+security|tax\s+id|bank\s+account|routing\s+number|PIN\s+code)\b/i;

const IP_HOST = /^(\d{1,3}\.){3}\d{1,3}$/;

export function phishingSeverityFromScore(score: number): SecurityAlertSeverity {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  if (score >= 18) return "low";
  return "info";
}

export function phishingVerdictFromScore(score: number): PhishingVerdict {
  if (score >= 62) return "likely_phishing";
  if (score >= 30) return "suspicious";
  return "likely_legitimate";
}

function analyzeUrl(urlRaw: string): PhishingSignal[] {
  const trimmed = urlRaw.trim();
  if (!trimmed) return [];

  const out: PhishingSignal[] = [];
  let parsed: URL;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProto);
  } catch {
    out.push({
      id: "url_malformed",
      label: "URL does not parse as a valid link (may be obfuscated)",
      weight: 12,
    });
    return out;
  }

  const host = parsed.hostname.toLowerCase();

  if (IP_HOST.test(host)) {
    out.push({
      id: "url_ip_literal",
      label: "Host is a raw IP address (uncommon for legitimate corporate mail)",
      weight: 22,
    });
  }

  if (host.startsWith("xn--") || host.includes(".xn--")) {
    out.push({
      id: "url_punycode",
      label: "Punycode / IDN hostname (sometimes used for homograph attacks)",
      weight: 14,
    });
  }

  if (parsed.protocol === "http:") {
    out.push({
      id: "url_http",
      label: "Link uses HTTP, not HTTPS",
      weight: 8,
    });
  }

  const segments = host.split(".");
  const mainLabel = segments[0] ?? "";
  if (mainLabel.length >= 28 && /[a-z0-9]{20,}/i.test(mainLabel)) {
    out.push({
      id: "url_long_random_subdomain",
      label: "Very long or random-looking subdomain",
      weight: 10,
    });
  }

  const knownShorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "buff.ly"];
  if (knownShorteners.some((d) => host === d || host.endsWith(`.${d}`))) {
    out.push({
      id: "url_shortener",
      label: "Known URL shortener (destination hidden until click)",
      weight: 6,
    });
  }

  if (/@/.test(parsed.pathname + parsed.search)) {
    out.push({
      id: "url_at_in_path",
      label: "“@” in path/query (sometimes used to mask real host)",
      weight: 16,
    });
  }

  return out;
}

function textSignals(text: string): PhishingSignal[] {
  const t = text.trim();
  if (t.length === 0) return [];

  const out: PhishingSignal[] = [];

  if (URGENCY.test(t)) {
    out.push({ id: "urgency", label: "Urgent or time-pressure language", weight: 14 });
  }
  if (FINANCIAL.test(t)) {
    out.push({ id: "financial", label: "Financial or payout / invoice pressure", weight: 16 });
  }
  if (EXEC_IMPERSONATION.test(t)) {
    out.push({
      id: "exec_impersonation",
      label: "Possible executive or authority impersonation",
      weight: 22,
    });
  }
  if (CREDENTIAL.test(t)) {
    out.push({ id: "credential", label: "Credential, MFA, or account verification request", weight: 18 });
  }
  if (SENSITIVE.test(t)) {
    out.push({ id: "sensitive", label: "Requests for highly sensitive personal/financial data", weight: 14 });
  }

  const wordish = t.split(/\s+/).filter(Boolean).length;
  const hasUrlInText = /https?:\/\/\S+|www\.\S+/i.test(t);
  if (wordish <= 22 && hasUrlInText && t.length < 400) {
    out.push({
      id: "short_with_link",
      label: "Short message dominated by a link (common in spear-phish)",
      weight: 12,
    });
  }

  return out;
}

/**
 * Deterministic spear-phishing-style scoring from body + optional URL.
 * Not a replacement for mailbox-level filters; demo / analyst assist only.
 */
export function analyzeSpearPhishing(emailBody: string, url: string): SpearPhishingAnalysis {
  const bodySignals = textSignals(emailBody);
  const urlSignals = analyzeUrl(url);
  const signals = [...bodySignals, ...urlSignals];

  const raw = signals.reduce((s, x) => s + x.weight, 0);
  const score = Math.min(100, Math.round(raw * 1.05));

  return {
    score,
    severity: phishingSeverityFromScore(score),
    verdict: phishingVerdictFromScore(score),
    signals,
  };
}
