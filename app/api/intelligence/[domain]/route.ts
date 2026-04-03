import { NextRequest, NextResponse } from "next/server";

const INTELLIGENCE_URL = process.env.INTELLIGENCE_SERVICE_URL;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ domain: string }> }
) {
  const { domain } = await context.params;

  if (!INTELLIGENCE_URL) {
    console.error("[intelligence] INTELLIGENCE_SERVICE_URL is not set");
    return NextResponse.json(
      { error: "Intelligence service is not configured" },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetch(
      `${INTELLIGENCE_URL}/api/v1/intelligence/${encodeURIComponent(domain)}`,
      { cache: "no-store" }
    );

    if (!upstream.ok) {
      throw new Error(`Upstream responded with ${upstream.status}`);
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(`[intelligence] failed for domain "${domain}":`, err);
    return NextResponse.json(
      { error: "Intelligence service unavailable", domain },
      { status: 502 }
    );
  }
}
