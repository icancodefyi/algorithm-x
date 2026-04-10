import { NextResponse } from "next/server";
import { getVulnerabilityOverview } from "@/lib/vulnerability-priority";

export async function GET() {
  try {
    const overview = getVulnerabilityOverview();
    return NextResponse.json(overview);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to build overview" }, { status: 500 });
  }
}
