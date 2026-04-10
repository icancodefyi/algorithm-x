import type { SecurityAlertSeverity } from "@/types/security-platform";

export interface PhishingSignal {
  id: string;
  label: string;
  /** Points contributed toward raw score (before cap). */
  weight: number;
}

export type PhishingVerdict = "likely_phishing" | "suspicious" | "likely_legitimate";

export interface SpearPhishingAnalysis {
  score: number;
  severity: SecurityAlertSeverity;
  verdict: PhishingVerdict;
  signals: PhishingSignal[];
}
