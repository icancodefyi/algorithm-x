import type {
  CreateSecurityAlertBody,
  SecurityAlert,
  SecurityAlertSeverity,
  SecurityAlertSource,
  SecurityAlertsOverview,
} from "@/types/security-platform";

const SEVERITY_SCORE: Record<SecurityAlertSeverity, number> = {
  critical: 95,
  high: 72,
  medium: 48,
  low: 28,
  info: 12,
};

/** Baseline when there are no open alerts (calm posture, not “broken”). */
const BASELINE_RISK = 8;

export function severityScore(severity: SecurityAlertSeverity): number {
  return SEVERITY_SCORE[severity] ?? SEVERITY_SCORE.info;
}

export function computeCompositeRisk(alerts: SecurityAlert[]): number {
  const open = alerts.filter((a) => !a.acknowledged);
  if (open.length === 0) return BASELINE_RISK;
  const maxScore = Math.max(...open.map((a) => severityScore(a.severity)));
  const volumeBoost = Math.min(12, open.length * 2);
  return Math.min(100, Math.round(maxScore * 0.85 + volumeBoost));
}

export function buildAlertsOverview(alerts: SecurityAlert[]): SecurityAlertsOverview {
  const openCount = alerts.filter((a) => !a.acknowledged).length;
  return {
    alerts,
    compositeRisk: computeCompositeRisk(alerts),
    openCount,
  };
}

export function isSecurityAlertSource(v: unknown): v is SecurityAlertSource {
  return (
    v === "media_verify" ||
    v === "spear_phishing" ||
    v === "malware" ||
    v === "cve" ||
    v === "policy" ||
    v === "countermeasures" ||
    v === "system"
  );
}

export function isSecurityAlertSeverity(v: unknown): v is SecurityAlertSeverity {
  return v === "critical" || v === "high" || v === "medium" || v === "low" || v === "info";
}

export function parseCreateAlertBody(body: unknown): CreateSecurityAlertBody | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (title.length < 1 || title.length > 240) return null;
  if (!isSecurityAlertSource(o.source)) return null;
  if (!isSecurityAlertSeverity(o.severity)) return null;
  const message =
    typeof o.message === "string" && o.message.trim().length > 0 ? o.message.trim() : undefined;
  const entityId =
    typeof o.entityId === "string" && o.entityId.trim().length > 0 ? o.entityId.trim() : undefined;
  const href =
    typeof o.href === "string" && o.href.trim().length > 0 ? o.href.trim() : undefined;
  return {
    source: o.source,
    severity: o.severity,
    title,
    message,
    entityId,
    href,
  };
}

export function demoSecurityAlerts(): SecurityAlert[] {
  const now = new Date().toISOString();
  return [
    {
      alertId: "demo-alert-media-1",
      source: "media_verify",
      severity: "high",
      title: "Synthetic media analysis queued",
      message: "Demo: deepfake pipeline flagged elevated manipulation probability.",
      entityId: "demo-case-media",
      href: "/verify/upload",
      createdAt: now,
      acknowledged: false,
    },
    {
      alertId: "demo-alert-cve-1",
      source: "cve",
      severity: "medium",
      title: "Internet-facing asset matches known CVE",
      message: "Demo: prioritize patch for payment-api exposure.",
      entityId: "asset-payment-api",
      href: "/command/vulnerabilities",
      createdAt: now,
      acknowledged: false,
    },
    {
      alertId: "demo-alert-phish-1",
      source: "spear_phishing",
      severity: "high",
      title: "Possible spear-phishing indicators",
      message: "Demo: executive impersonation language detected.",
      entityId: null,
      href: "/command/phishing",
      createdAt: now,
      acknowledged: false,
    },
  ];
}

/** Map MongoDB document (snake_case storage) to API shape. */
export function docToAlert(doc: {
  alert_id: string;
  source: string;
  severity: string;
  title: string;
  message?: string | null;
  entity_id?: string | null;
  href?: string | null;
  created_at: Date;
  acknowledged?: boolean;
}): SecurityAlert | null {
  if (
    !doc.alert_id ||
    !isSecurityAlertSource(doc.source) ||
    !isSecurityAlertSeverity(doc.severity)
  ) {
    return null;
  }
  return {
    alertId: doc.alert_id,
    source: doc.source,
    severity: doc.severity,
    title: doc.title,
    message: doc.message ?? null,
    entityId: doc.entity_id ?? null,
    href: doc.href ?? null,
    createdAt:
      doc.created_at instanceof Date
        ? doc.created_at.toISOString()
        : new Date(doc.created_at).toISOString(),
    acknowledged: Boolean(doc.acknowledged),
  };
}
