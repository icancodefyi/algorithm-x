import clientPromise from "@/lib/mongodb";

export type ClaimEventType =
  | "case_created"
  | "case_saved"
  | "report_viewed"
  | "escalation_requested"
  | "platform_report_submitted"
  | "takedown_requested"
  | "takedown_rejected"
  | "content_removed_confirmed";

interface RecordClaimEventInput {
  eventType: ClaimEventType;
  caseId: string;
  platformSource?: string;
  issueType?: string;
  pipelineType?: string;
  anonymous?: boolean;
  source?: "web" | "api" | "system";
}

function buildCaseRef(caseId: string): string {
  return `SNF-${caseId.slice(0, 4).toUpperCase()}-${caseId.slice(4, 8).toUpperCase()}-${caseId.slice(9, 13).toUpperCase()}`;
}

export async function recordClaimEvent(input: RecordClaimEventInput): Promise<{ insertedCase: boolean }> {
  const client = await clientPromise;
  const db = client.db("snifferX");
  const eventsCol = db.collection("claim_events");
  const casesCol = db.collection("cases");
  const metricsCol = db.collection("claim_metrics");

  const now = new Date();

  await eventsCol.insertOne({
    event_type: input.eventType,
    case_id: input.caseId,
    platform_source: input.platformSource ?? null,
    issue_type: input.issueType ?? null,
    pipeline_type: input.pipelineType ?? null,
    anonymous: input.anonymous ?? true,
    source: input.source ?? "web",
    created_at: now,
  });

  let insertedCase = false;

  if (input.eventType === "case_created") {
    const createdAtSec = Math.floor(now.getTime() / 1000);
    const upsertResult = await casesCol.updateOne(
      { case_id: input.caseId },
      {
        $setOnInsert: {
          case_id: input.caseId,
          case_ref: buildCaseRef(input.caseId),
          created_at: createdAtSec,
          anonymous: input.anonymous ?? true,
          platform_source: input.platformSource ?? "Other",
          issue_type: input.issueType ?? "Other",
          pipeline_type: input.pipelineType ?? "deepfake",
          status: "pending",
          no_further_tracking: false,
        },
      },
      { upsert: true },
    );

    insertedCase = upsertResult.upsertedCount === 1;
  }

  const inc: Record<string, number> = {
    total_events: 1,
    [`events.${input.eventType}`]: 1,
  };

  if (insertedCase) {
    inc.total_cases = 1;
  }

  await metricsCol.updateOne(
    { key: "global" },
    {
      $inc: inc,
      $set: { updated_at: now },
      $setOnInsert: { key: "global", created_at: now },
    },
    { upsert: true },
  );

  return { insertedCase };
}

export async function getClaimStats() {
  const client = await clientPromise;
  const db = client.db("snifferX");
  const metricsCol = db.collection("claim_metrics");
  const casesCol = db.collection("cases");

  const [metrics, totalCases] = await Promise.all([
    metricsCol.findOne({ key: "global" }, { projection: { _id: 0 } }),
    casesCol.countDocuments(),
  ]);

  return {
    total_cases: totalCases,
    total_events: metrics?.total_events ?? 0,
    events: metrics?.events ?? {},
    updated_at: metrics?.updated_at ?? null,
  };
}
