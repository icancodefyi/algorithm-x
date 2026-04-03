import { NextRequest, NextResponse } from "next/server";

const TAKEDOWN_URL = process.env.TAKEDOWN_SERVICE_URL;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ domain: string }> }
) {
  const { domain } = await context.params;

  if (!TAKEDOWN_URL) {
    console.error("[takedown] TAKEDOWN_SERVICE_URL is not set");
    return NextResponse.json(
      { error: "Takedown service is not configured" },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetch(
      `${TAKEDOWN_URL}/api/v1/takedown/${encodeURIComponent(domain)}`,
      { cache: "no-store" }
    );

    if (!upstream.ok) {
      throw new Error(`Upstream responded with ${upstream.status}`);
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(`[takedown] failed for domain "${domain}":`, err);
    return NextResponse.json(
      { error: "Takedown service unavailable", domain },
      { status: 502 }
    );
  }
}
