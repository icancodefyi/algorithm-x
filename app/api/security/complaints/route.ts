import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getMongoClient } from "@/lib/mongodb";
import {
  makeComplaintRef,
  nextStepsFor,
  parseComplaintBody,
  parseEvidenceUrls,
} from "@/lib/security-complaints";
import { INCIDENT_TYPE_LABELS } from "@/types/security-complaint";

const COMPLAINTS_COL = "security_complaints";
const ALERTS_COL = "security_alerts";
const DB_NAME = "snifferX";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseComplaintBody(json);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "Invalid body: need incidentType, narrative (40–12000 chars), optional valid contactEmail.",
      },
      { status: 400 },
    );
  }

  const evidenceUrls = parseEvidenceUrls(parsed.evidenceUrls);
  const { complaintId, complaintRef } = makeComplaintRef();
  const createdAt = new Date();

  const doc = {
    complaint_id: complaintId,
    complaint_ref: complaintRef,
    created_at: createdAt,
    incident_type: parsed.incidentType,
    title: parsed.title,
    narrative: parsed.narrative,
    evidence_urls: evidenceUrls,
    platform_or_channel: parsed.platformOrChannel || null,
    related_case_id: parsed.relatedCaseId || null,
    contact_email: parsed.contactEmail || null,
    consent_followup: parsed.consentFollowup,
    status: "submitted" as const,
  };

  try {
    const client = await getMongoClient();
    await client.db(DB_NAME).collection(COMPLAINTS_COL).insertOne(doc);

    const label = INCIDENT_TYPE_LABELS[parsed.incidentType];
    const alertDoc = {
      alert_id: randomUUID(),
      source: "user_complaint" as const,
      severity: "medium" as const,
      title: `Structured complaint filed · ${complaintRef}`,
      message: `${label}${parsed.platformOrChannel ? ` · ${parsed.platformOrChannel.slice(0, 120)}` : ""}. Reference saved for your records.`,
      entity_id: complaintId,
      href: "/command/complaint",
      created_at: createdAt,
      acknowledged: false,
    };

    await client.db(DB_NAME).collection(ALERTS_COL).insertOne(alertDoc).catch(() => {});
  } catch {
    return NextResponse.json(
      { error: "Could not save complaint (check MONGODB_URI)." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    complaintId,
    complaintRef,
    nextSteps: nextStepsFor(parsed.incidentType),
  });
}
