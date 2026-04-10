import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  analyzeSpearPhishing,
  phishingSeverityFromScore,
  phishingVerdictFromScore,
} from "@/lib/spear-phishing-heuristics";
import type { PhishingVerdict } from "@/types/spear-phishing";

interface Body {
  emailBody?: string;
  url?: string;
}

const VERDICTS = new Set(["likely_phishing", "suspicious", "likely_legitimate"]);

function tryParseLlmJson(raw: string): { riskScore: number; rationale: string; verdict?: PhishingVerdict } | null {
  let s = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```\s*$/i.exec(s);
  if (fence) s = fence[1].trim();

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(s) as Record<string, unknown>;
  } catch {
    return null;
  }

  const risk = Number(obj.riskScore ?? obj.score);
  if (!Number.isFinite(risk)) return null;

  const rationaleRaw =
    typeof obj.rationale === "string"
      ? obj.rationale
      : typeof obj.summary === "string"
        ? obj.summary
        : typeof obj.analysis === "string"
          ? obj.analysis
          : "";
  const rationale = rationaleRaw.trim();

  let verdict: PhishingVerdict | undefined;
  const v = obj.verdict;
  if (typeof v === "string" && VERDICTS.has(v)) {
    verdict = v as PhishingVerdict;
  }

  return {
    riskScore: Math.min(100, Math.max(0, Math.round(risk))),
    rationale: rationale || "No rationale text returned.",
    verdict,
  };
}

/** Blend heuristic pre-scan with LLM risk (LLM weighted higher for “AI analysis”). */
function mergeScores(heuristicScore: number, llmScore: number): number {
  const h = Math.min(100, Math.max(0, heuristicScore));
  const m = Math.min(100, Math.max(0, llmScore));
  return Math.min(100, Math.round(h * 0.35 + m * 0.65));
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

  const bodyOk = emailBody.trim().length >= 10;
  const urlOk = url.trim().length >= 8;
  if (!bodyOk && !urlOk) {
    return NextResponse.json(
      { error: "Provide at least ~10 characters of message text and/or a full URL to analyze." },
      { status: 400 },
    );
  }

  if (emailBody.length > 12000) {
    return NextResponse.json({ error: "Message body too long (max 12k chars)." }, { status: 400 });
  }

  const heuristic = analyzeSpearPhishing(emailBody, url);
  const heuristicScore = heuristic.score;

  const key = process.env.GROQ_API_KEY;
  let modelScore: number | null = null;
  let analystNote: string | null = null;
  let llmUsed = false;

  if (key) {
    try {
      const groq = new Groq({ apiKey: key });
      const signalLine =
        heuristic.signals.map((s) => `${s.label} (+${s.weight})`).join("; ") || "None flagged";

      const userPayload = `You are triaging possible spear-phishing / business email compromise.

MESSAGE (may be truncated):
---
${emailBody.slice(0, 8000)}
---

URL PROVIDED (or "none"): ${url.trim() || "none"}

RULES:
- Output ONLY valid JSON, no markdown fences, no other text.
- riskScore: integer 0-100 (likelihood of malicious social engineering / phishing intent).
- verdict: exactly one of: "likely_phishing", "suspicious", "likely_legitimate"
- rationale: 2-5 sentences for a SOC analyst; note uncertainty; no legal accusations.

Heuristic pre-scan (may false positive): score ${heuristicScore}/100. Signals: ${signalLine}

JSON shape:
{"riskScore":<number>,"verdict":"<string>","rationale":"<string>"}`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You only output a single JSON object. No markdown. You assess spear-phishing risk from text and URLs; you are not a lawyer.",
          },
          { role: "user", content: userPayload },
        ],
        temperature: 0.2,
        max_tokens: 500,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      const parsed = tryParseLlmJson(text);

      if (parsed) {
        modelScore = parsed.riskScore;
        analystNote = parsed.rationale;
        llmUsed = true;
      } else {
        analystNote =
          "Groq returned non-JSON output; showing heuristics only. Check server logs or retry.";
      }
    } catch {
      analystNote = null;
      modelScore = null;
    }
  }

  let finalScore = heuristicScore;
  let finalVerdict = heuristic.verdict;
  let finalSeverity = heuristic.severity;

  if (llmUsed && modelScore !== null) {
    finalScore = mergeScores(heuristicScore, modelScore);
    finalSeverity = phishingSeverityFromScore(finalScore);
    finalVerdict = phishingVerdictFromScore(finalScore);
  }

  return NextResponse.json({
    score: finalScore,
    severity: finalSeverity,
    verdict: finalVerdict,
    signals: heuristic.signals,
    heuristicScore,
    modelScore,
    analystNote,
    llmUsed,
  });
}
