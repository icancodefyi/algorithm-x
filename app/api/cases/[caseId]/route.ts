import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function normalizeCreatedAt(value: unknown): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return Math.floor(value.getTime() / 1000);
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return Math.floor(d.getTime() / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

export async function GET(_req: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await context.params;

  if (!caseId) {
    return NextResponse.json({ error: "caseId is required" }, { status: 400 });
  }

  try {
    const client = await getMongoClient();
    const col = client.db("snifferX").collection("cases");
    const doc = await col.findOne(
      { case_id: caseId },
      {
        projection: {
          _id: 0,
          case_id: 1,
          created_at: 1,
          anonymous: 1,
          platform_source: 1,
          issue_type: 1,
          description: 1,
          pipeline_type: 1,
        },
      },
    );

    if (doc) {
      return NextResponse.json({
        case_id: String(doc.case_id ?? caseId),
        created_at: normalizeCreatedAt(doc.created_at),
        anonymous: typeof doc.anonymous === "boolean" ? doc.anonymous : true,
        platform_source: typeof doc.platform_source === "string" ? doc.platform_source : "Other",
        issue_type: typeof doc.issue_type === "string" ? doc.issue_type : "Other",
        description: typeof doc.description === "string" ? doc.description : null,
        pipeline_type: typeof doc.pipeline_type === "string" ? doc.pipeline_type : "deepfake",
      });
    }
  } catch {
    // Fall through to backend service fetch attempt.
  }

  // Fallback to analysis service for older in-memory cases.
  try {
    const res = await fetch(`${API_URL}/api/cases/${caseId}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
}
