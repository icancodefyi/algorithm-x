import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
  caseContext: {
    caseData: Record<string, unknown> | null;
    analysis: Record<string, unknown> | null;
  };
}

const STRIP_KEYS = new Set([
  "tamper_heatmap",
  "ela_heatmap",
  "recent_events",
  "supporting_evidence",
]);

function trimContext(obj: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!obj) return null;
  const trimmed: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (STRIP_KEYS.has(k)) continue;
    if (typeof v === "string" && v.length > 500) {
      trimmed[k] = v.slice(0, 200) + "…[truncated]";
      continue;
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      trimmed[k] = trimContext(v as Record<string, unknown>);
      continue;
    }
    if (Array.isArray(v) && v.length > 20) {
      trimmed[k] = v.slice(0, 20);
      continue;
    }
    trimmed[k] = v;
  }
  return trimmed;
}

function buildSystemPrompt(ctx: RequestBody["caseContext"]): string {
  const caseBlock = ctx.caseData
    ? JSON.stringify(trimContext(ctx.caseData), null, 2)
    : "No case data available.";

  const analysisBlock = ctx.analysis
    ? JSON.stringify(trimContext(ctx.analysis), null, 2)
    : "Analysis has not completed yet.";

  return `You are a forensic case analyst embedded in Sniffer, a digital media verification and deepfake detection platform. You have full access to the forensic analysis of the current case.

CASE METADATA:
${caseBlock}

FORENSIC ANALYSIS PAYLOAD:
${analysisBlock}

BEHAVIORAL RULES:
- You are an investigator, not customer support. Be terse, precise, factual.
- Reference specific numeric values from the case data when answering.
- Never say "I think" or "I believe" — state findings as evidence.
- When explaining a metric (ELA, SSIM, pHash, DCT, PRNU, C2PA, etc.), always tie it back to THIS case's actual values.
- If the user asks "why is the score X?" — explain what forensic signals contributed and cite specific numbers.
- Format numbers with units: percentages, scores, distances.
- If asked about something not in the case data, say so clearly.
- If the user writes in a non-English language, respond in that same language.
- Keep responses concise — typically 2-5 sentences. Expand only when the user asks for detail.
- Use forensic terminology naturally but explain jargon when a user seems unfamiliar.
- You may use markdown formatting: **bold** for key values, \`code\` for technical identifiers.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = (await req.json()) as RequestBody;
  const systemPrompt = buildSystemPrompt(body.caseContext);

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...body.messages.slice(-10),
  ];

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      stream: true,
      temperature: 0.3,
      max_tokens: 1024,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: unknown) {
    const errObj = err as { status?: number; error?: { message?: string } };
    if (errObj?.status === 400) {
      return new Response(
        JSON.stringify({ error: "Context too large. Please start a new conversation." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const msg = err instanceof Error ? err.message : "Groq API error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
