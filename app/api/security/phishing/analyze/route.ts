import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { analyzeSpearPhishing } from "@/lib/spear-phishing-heuristics";

interface Body {
  emailBody?: string;
  url?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailBody = typeof body.emailBody === "string" ? body.emailBody : "";
  const url = typeof body.url === "string" ? body.url : "";

  if (emailBody.trim().length < 12 && url.trim().length < 4) {
    return NextResponse.json(
      { error: "Provide a longer message body and/or a URL to analyze." },
      { status: 400 },
    );
  }

  if (emailBody.length > 12000) {
    return NextResponse.json({ error: "Message body too long (max 12k chars)." }, { status: 400 });
  }

  const analysis = analyzeSpearPhishing(emailBody, url);

  let analystNote: string | null = null;
  const key = process.env.GROQ_API_KEY;
  if (key) {
    try {
      const groq = new Groq({ apiKey: key });
      const signalLine = analysis.signals.map((s) => s.label).join("; ") || "No strong heuristic hits";
      const snippet = emailBody.slice(0, 900);
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You assist security analysts triaging possible spear-phishing. Be concise (2–4 sentences), factual, and non-alarmist. Say indicators are heuristic only. Do not claim certainty or legal conclusions.",
          },
          {
            role: "user",
            content: `Heuristic score ${analysis.score}/100, verdict ${analysis.verdict}. Signals: ${signalLine}\n\nOptional URL field: ${url || "(none)"}\n\nMessage:\n${snippet}`,
          },
        ],
        temperature: 0.25,
        max_tokens: 220,
      });
      analystNote = completion.choices[0]?.message?.content?.trim() ?? null;
    } catch {
      analystNote = null;
    }
  }

  return NextResponse.json({
    ...analysis,
    analystNote,
    groqAvailable: Boolean(key && analystNote),
  });
}
