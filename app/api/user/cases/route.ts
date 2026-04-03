import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient();
    const col = client.db("snifferX").collection("cases");
    const url = new URL(req.url);
    const caseId = url.searchParams.get("caseId");

    if (caseId) {
      const doc = await col.findOne({ case_id: caseId });
      return NextResponse.json({ saved: !!doc });
    }

    // All cases
    const cases = await col
      .find(
        {},
        {
          projection: {
            _id: 0,
            case_id: 1,
            case_ref: 1,
            platform_source: 1,
            last_saved_at: 1,
            updated_at: 1,
            created_at: 1,
          },
        },
      )
      .sort({ last_saved_at: -1, updated_at: -1, created_at: -1 })
      .toArray();

    const normalized = cases.map((doc: Record<string, unknown>) => {
      const rawSavedAt = doc.last_saved_at ?? doc.updated_at ?? doc.created_at ?? null;
      const savedAt =
        rawSavedAt instanceof Date
          ? rawSavedAt.toISOString()
          : typeof rawSavedAt === "number"
            ? new Date(rawSavedAt * 1000).toISOString()
            : typeof rawSavedAt === "string"
              ? rawSavedAt
              : null;

      return {
        caseId: typeof doc.case_id === "string" ? doc.case_id : "",
        domain: typeof doc.platform_source === "string" ? doc.platform_source : null,
        caseRef: typeof doc.case_ref === "string" ? doc.case_ref : null,
        savedAt: savedAt ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({ cases: normalized });
  } catch {
    // Fallback when MongoDB is unavailable
    const url = new URL(req.url);
    const caseId = url.searchParams.get("caseId");
    if (caseId) {
      return NextResponse.json({ saved: false });
    }
    return NextResponse.json({ cases: [] });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const caseId = url.searchParams.get("caseId");

  if (!caseId) {
    return NextResponse.json({ error: "caseId is required" }, { status: 400 });
  }

  const client = await getMongoClient();
  await client
    .db("snifferX")
    .collection("cases")
    .deleteOne({ case_id: caseId });

  return NextResponse.json({ ok: true });
}
