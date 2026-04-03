import { NextRequest, NextResponse } from "next/server";
import { getClaimStats, recordClaimEvent } from "@/lib/claim-tracker";

interface TrackBody {
  eventType?:
    | "case_created"
    | "case_saved"
    | "report_viewed"
    | "escalation_requested"
    | "platform_report_submitted"
    | "takedown_requested"
    | "takedown_rejected"
    | "content_removed_confirmed";
  caseId?: string;
  platformSource?: string;
  issueType?: string;
  pipelineType?: string;
  anonymous?: boolean;
}

export async function GET() {
  try {
    const stats = await getClaimStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Failed to fetch claim stats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TrackBody;

    if (!body.eventType || !body.caseId) {
      return NextResponse.json({ error: "eventType and caseId are required" }, { status: 400 });
    }

    const result = await recordClaimEvent({
      eventType: body.eventType,
      caseId: body.caseId,
      platformSource: body.platformSource,
      issueType: body.issueType,
      pipelineType: body.pipelineType,
      anonymous: body.anonymous,
      source: "web",
    });

    return NextResponse.json({ ok: true, insertedCase: result.insertedCase });
  } catch {
    return NextResponse.json({ error: "Failed to track claim event" }, { status: 500 });
  }
}
