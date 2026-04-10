import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getMongoClient } from "@/lib/mongodb";
import {
  buildAlertsOverview,
  demoSecurityAlerts,
  docToAlert,
  parseCreateAlertBody,
} from "@/lib/security-alerts";

const COLLECTION = "security_alerts";
const DB_NAME = "snifferX";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit");
  const limit = Math.min(100, Math.max(1, Number(limitRaw) || 50));

  try {
    const client = await getMongoClient();
    const col = client.db(DB_NAME).collection(COLLECTION);
    const docs = await col
      .find(
        {},
        {
          projection: {
            _id: 0,
            alert_id: 1,
            source: 1,
            severity: 1,
            title: 1,
            message: 1,
            entity_id: 1,
            href: 1,
            created_at: 1,
            acknowledged: 1,
          },
        },
      )
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    const alerts = docs
      .map((d) =>
        docToAlert({
          alert_id: String(d.alert_id ?? ""),
          source: String(d.source ?? ""),
          severity: String(d.severity ?? ""),
          title: String(d.title ?? ""),
          message: d.message as string | null | undefined,
          entity_id: d.entity_id as string | null | undefined,
          href: d.href as string | null | undefined,
          created_at: d.created_at as Date,
          acknowledged: Boolean(d.acknowledged),
        }),
      )
      .filter((a): a is NonNullable<typeof a> => a !== null);

    const overview = buildAlertsOverview(alerts);
    return NextResponse.json(overview);
  } catch {
    const demo = demoSecurityAlerts();
    return NextResponse.json(buildAlertsOverview(demo));
  }
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseCreateAlertBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid body: need source, severity, title (1–240 chars)" },
      { status: 400 },
    );
  }

  const alertId = randomUUID();
  const createdAt = new Date();

  const doc = {
    alert_id: alertId,
    source: parsed.source,
    severity: parsed.severity,
    title: parsed.title,
    message: parsed.message ?? null,
    entity_id: parsed.entityId ?? null,
    href: parsed.href ?? null,
    created_at: createdAt,
    acknowledged: false,
  };

  try {
    const client = await getMongoClient();
    await client.db(DB_NAME).collection(COLLECTION).insertOne(doc);
  } catch {
    return NextResponse.json(
      { error: "Could not persist alert (check MONGODB_URI)" },
      { status: 503 },
    );
  }

  const alert = docToAlert({
    alert_id: alertId,
    source: doc.source,
    severity: doc.severity,
    title: doc.title,
    message: doc.message,
    entity_id: doc.entity_id,
    href: doc.href,
    created_at: createdAt,
    acknowledged: false,
  });

  return NextResponse.json(alert, { status: 201 });
}
