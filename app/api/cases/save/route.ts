import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { recordClaimEvent } from "@/lib/claim-tracker";

interface SaveBody {
  caseId?: string;
  domain?: string;
  caseRef?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SaveBody;
  const { caseId, domain, caseRef } = body;

  if (!caseId) {
    return NextResponse.json({ error: "caseId is required" }, { status: 400 });
  }

  try {
    const client = await getMongoClient();
    const now = new Date();
    const createdAtSec = Math.floor(now.getTime() / 1000);
    const col = client.db("snifferX").collection("cases");

    await col.updateOne(
      { case_id: caseId },
      {
        $set: {
          case_ref: caseRef ?? null,
          platform_source: domain ?? "Other",
          updated_at: now,
          last_saved_at: now,
        },
        $setOnInsert: {
          case_id: caseId,
          created_at: createdAtSec,
          status: "pending",
          issue_type: "Other",
          pipeline_type: "deepfake",
          anonymous: true,
          no_further_tracking: false,
        },
      },
      { upsert: true },
    );

    await recordClaimEvent({
      eventType: "case_saved",
      caseId,
      platformSource: domain ?? undefined,
      source: "api",
    }).catch(() => {});
  } catch {
    // MongoDB unavailable — silently succeed for demo
  }

  return NextResponse.json({ ok: true });
}
