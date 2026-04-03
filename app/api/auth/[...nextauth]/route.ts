import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}

export async function POST() {
  return NextResponse.json({ error: "Auth is disabled" }, { status: 404 });
}
