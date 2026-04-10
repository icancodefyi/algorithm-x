/** Sources that can emit rows into the unified security alert feed (PS2 platform). */
export type SecurityAlertSource =
  | "media_verify"
  | "spear_phishing"
  | "malware"
  | "cve"
  | "policy"
  | "countermeasures"
  | "user_complaint"
  | "system";

export type SecurityAlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface SecurityAlert {
  alertId: string;
  source: SecurityAlertSource;
  severity: SecurityAlertSeverity;
  title: string;
  message: string | null;
  entityId: string | null;
  href: string | null;
  createdAt: string;
  acknowledged: boolean;
}

export interface CreateSecurityAlertBody {
  source: SecurityAlertSource;
  severity: SecurityAlertSeverity;
  title: string;
  message?: string;
  entityId?: string;
  href?: string;
}

export interface SecurityAlertsOverview {
  alerts: SecurityAlert[];
  compositeRisk: number;
  openCount: number;
}
