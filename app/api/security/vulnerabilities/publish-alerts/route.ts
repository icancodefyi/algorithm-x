import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getMongoClient } from "@/lib/mongodb";
import { getVulnerabilityOverview } from "@/lib/vulnerability-priority";
import type { CveSeverityBand } from "@/types/vulnerability";
import type { SecurityAlertSeverity } from "@/types/security-platform";

const COLLECTION = "security_alerts";
const DB_NAME = "snifferX";

function bandToAlertSeverity(band: CveSeverityBand): SecurityAlertSeverity {
  if (band === "critical") return "critical";
  if (band === "high") return "high";
  if (band === "medium") return "medium";
  return "low";
}

export async function POST(request: Request) {
  let limit = 3;
  try {
    const body = await request.json().catch(() => ({}));
    if (body && typeof body === "object" && typeof (body as { limit?: unknown }).limit === "number") {
      const n = Math.floor((body as { limit: number }).limit);
      if (n >= 1 && n <= 10) limit = n;
    }
  } catch {
    /* default limit */
  }

  const { prioritized } = getVulnerabilityOverview();
  const top = prioritized.slice(0, limit);

  if (top.length === 0) {
    return NextResponse.json({ created: 0, message: "No prioritized rows" });
  }

  const docs = top.map((row) => {
    const summary = row.reasons.slice(0, 2).join(" · ");
    const assets = row.affectedAssets.map((a) => a.name).join(", ");
    return {
      alert_id: randomUUID(),
      source: "cve" as const,
      severity: bandToAlertSeverity(row.severity),
      title: `Patch priority: ${row.cveId}`,
      message: `${row.title} — ${summary} Affected: ${assets}.`,
      entity_id: row.cveId,
      href: `/command/vulnerabilities?highlight=${encodeURIComponent(row.cveId)}`,
      created_at: new Date(),
      acknowledged: false,
    };
  });

  try {
    const client = await getMongoClient();
    await client.db(DB_NAME).collection(COLLECTION).insertMany(docs);
  } catch {
    return NextResponse.json(
      { error: "Could not persist alerts (check MONGODB_URI)" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    created: docs.length,
    cveIds: top.map((r) => r.cveId),
  });
}
