import { NextResponse } from "next/server";
import { loadPolicyCorpus } from "@/lib/policy-corpus";

export async function GET() {
  const sections = loadPolicyCorpus();
  const byDoc = new Map<
    string,
    { docId: string; documentTitle: string; sectionCount: number }
  >();

  for (const s of sections) {
    const cur = byDoc.get(s.docId);
    if (cur) {
      cur.sectionCount += 1;
    } else {
      byDoc.set(s.docId, {
        docId: s.docId,
        documentTitle: s.documentTitle,
        sectionCount: 1,
      });
    }
  }

  const documents = [...byDoc.values()].sort((a, b) =>
    a.documentTitle.localeCompare(b.documentTitle),
  );

  return NextResponse.json({
    ok: true,
    source: "data/policies",
    sectionCount: sections.length,
    documents,
  });
}
