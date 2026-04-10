export type IncidentType =
  | "spear_phishing"
  | "malware"
  | "synthetic_media"
  | "financial_fraud"
  | "account_compromise"
  | "harassment_abuse"
  | "vulnerability_exposure"
  | "other";

export interface CreateComplaintBody {
  incidentType: IncidentType;
  title?: string;
  narrative: string;
  evidenceUrls?: string;
  platformOrChannel?: string;
  relatedCaseId?: string;
  contactEmail?: string;
  consentFollowup?: boolean;
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  spear_phishing: "Spear-phishing / suspicious message",
  malware: "Malware or malicious file",
  synthetic_media: "Synthetic / manipulated media (deepfake)",
  financial_fraud: "Financial fraud or scam payment",
  account_compromise: "Account takeover / credential abuse",
  harassment_abuse: "Harassment or non-consensual content",
  vulnerability_exposure: "Vulnerability exposure / patch prioritization",
  other: "Other cyber incident",
};
