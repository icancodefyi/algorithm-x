import { randomUUID } from "crypto";
import type { CreateComplaintBody, IncidentType } from "@/types/security-complaint";

const INCIDENT_TYPES = new Set<string>([
  "spear_phishing",
  "malware",
  "synthetic_media",
  "financial_fraud",
  "account_compromise",
  "harassment_abuse",
  "vulnerability_exposure",
  "other",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEvidenceUrls(raw: string | undefined): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 2000)
    .slice(0, 25);
}

export function parseComplaintBody(body: unknown): (CreateComplaintBody & { narrative: string; incidentType: IncidentType }) | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;

  const incidentRaw = o.incidentType ?? o.incident_type;
  if (typeof incidentRaw !== "string" || !INCIDENT_TYPES.has(incidentRaw)) return null;

  const narrative = typeof o.narrative === "string" ? o.narrative.trim() : "";
  if (narrative.length < 40 || narrative.length > 12000) return null;

  const title =
    typeof o.title === "string" && o.title.trim().length > 0
      ? o.title.trim().slice(0, 200)
      : narrative.slice(0, 120) + (narrative.length > 120 ? "…" : "");

  const evidenceUrls =
    typeof o.evidenceUrls === "string"
      ? o.evidenceUrls
      : typeof o.evidence_urls === "string"
        ? o.evidence_urls
        : "";

  const platformOrChannel =
    typeof o.platformOrChannel === "string"
      ? o.platformOrChannel.trim().slice(0, 300)
      : typeof o.platform_or_channel === "string"
        ? o.platform_or_channel.trim().slice(0, 300)
        : "";

  const relatedCaseId =
    typeof o.relatedCaseId === "string"
      ? o.relatedCaseId.trim().slice(0, 80)
      : typeof o.related_case_id === "string"
        ? o.related_case_id.trim().slice(0, 80)
        : "";

  const contactEmailRaw =
    typeof o.contactEmail === "string"
      ? o.contactEmail.trim()
      : typeof o.contact_email === "string"
        ? o.contact_email.trim()
        : "";
  const contactEmail =
    contactEmailRaw.length === 0 ? "" : EMAIL_RE.test(contactEmailRaw) ? contactEmailRaw : null;
  if (contactEmail === null) return null;

  const consentFollowup = Boolean(o.consentFollowup ?? o.consent_followup);

  return {
    incidentType: incidentRaw as IncidentType,
    title,
    narrative,
    evidenceUrls,
    platformOrChannel,
    relatedCaseId: relatedCaseId || undefined,
    contactEmail: contactEmail || undefined,
    consentFollowup,
  };
}

export function makeComplaintRef(): { complaintId: string; complaintRef: string } {
  const complaintId = randomUUID();
  const short = complaintId.replace(/-/g, "").slice(0, 10).toUpperCase();
  const complaintRef = `SC-${short}`;
  return { complaintId, complaintRef };
}

export function nextStepsFor(incidentType: IncidentType): string[] {
  const common = [
    "Keep originals: export emails with headers if possible, or full-page screenshots with timestamps.",
    "Do not pay or engage further with the sender until you have verified through a second channel.",
  ];
  const byType: Record<IncidentType, string[]> = {
    spear_phishing: [
      "Report the message to your IT or security team and to the impersonated organization (via their official site).",
      "If credentials were entered, change passwords and enable MFA on affected accounts.",
      ...common,
    ],
    malware: [
      "Isolate the device from the network and run an updated scan with reputable security software.",
      "Preserve the suspicious file/hash for investigators; do not forward it to personal accounts.",
      ...common,
    ],
    synthetic_media: [
      "Use Sniffer media verification to generate a forensic case and document distribution URLs.",
      "Consider platform abuse reporting and local law guidance where non-consensual imagery is involved.",
      ...common,
    ],
    financial_fraud: [
      "Contact your bank or payment provider immediately with this reference and any transaction IDs.",
      "File reports with national cybercrime / consumer fraud portals where available.",
      ...common,
    ],
    account_compromise: [
      "Revoke active sessions, rotate passwords, and review connected apps and recovery email/phone.",
      "Check for forwarding rules or wallet address changes in email and finance apps.",
      ...common,
    ],
    harassment_abuse: [
      "Document each incident with dates; avoid engaging with the harasser on the same channel.",
      "Use trusted support (platform safety, legal aid) appropriate to your jurisdiction.",
      ...common,
    ],
    other: [
      "Attach any technical indicators (IPs, domains, hashes) when escalating to authorities or your SOC.",
      ...common,
    ],
    vulnerability_exposure: [
      "Open a formal change window for the affected stacks; test patches in staging before production.",
      "Track remediation in your ticket system with CVE IDs and asset owners from this report.",
      ...common,
    ],
  };
  return byType[incidentType];
}
