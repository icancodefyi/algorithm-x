import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  POLICY_QA_SYSTEM_PROMPT,
  buildPolicyContextBlock,
} from "@/lib/policy-ask-prompt";
import {
  excerpt,
  loadPolicyCorpus,
  retrievePolicySections,
  type PolicySection,
} from "@/lib/policy-corpus";
import type { PolicyAskResponse, PolicyCitation } from "@/types/policy-qa";

interface Body {
  query?: string;
}

function isConfidence(v: unknown): v is PolicyAskResponse["confidence"] {
  return v === "high" || v === "medium" || v === "low";
}

function normalizeCitation(raw: Record<string, unknown>): PolicyCitation | null {
  const docId = typeof raw.docId === "string" ? raw.docId.trim() : "";
  const documentTitle =
    typeof raw.documentTitle === "string" ? raw.documentTitle.trim() : "";
  const sectionHeading =
    typeof raw.sectionHeading === "string" ? raw.sectionHeading.trim() : "";
  const ex = typeof raw.excerpt === "string" ? raw.excerpt.trim() : "";
  if (!docId || !documentTitle || !sectionHeading || !ex) return null;
  return {
    docId,
    documentTitle,
    sectionHeading,
    excerpt: excerpt(ex, 280),
  };
}

function tryParsePolicyAskJson(raw: string): PolicyAskResponse | null {
  let s = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```\s*$/i.exec(s);
  if (fence) s = fence[1].trim();

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(s) as Record<string, unknown>;
  } catch {
    return null;
  }

  const answer =
    typeof obj.answer_markdown === "string"
      ? obj.answer_markdown.trim()
      : typeof obj.answer === "string"
        ? obj.answer.trim()
        : "";
  if (!answer) return null;

  const conf = obj.confidence;
  if (!isConfidence(conf)) return null;

  const citRaw = obj.citations;
  const citations: PolicyCitation[] = [];
  if (Array.isArray(citRaw)) {
    for (const c of citRaw) {
      if (c && typeof c === "object") {
        const n = normalizeCitation(c as Record<string, unknown>);
        if (n) citations.push(n);
      }
    }
  }

  const fu = obj.follow_up_questions;
  const follow: string[] = [];
  if (Array.isArray(fu)) {
    for (const q of fu) {
      if (typeof q === "string" && q.trim()) follow.push(q.trim());
    }
  }

  return {
    answer_markdown: answer,
    citations,
    confidence: conf,
    follow_up_questions: follow.slice(0, 3),
  };
}

function fallbackFromSections(
  retrieved: PolicySection[],
  prefix: string,
): PolicyAskResponse {
  const citations: PolicyCitation[] = retrieved.map((s) => ({
    docId: s.docId,
    documentTitle: s.documentTitle,
    sectionHeading: s.sectionHeading,
    excerpt: excerpt(s.content, 280),
  }));

  const body = retrieved
    .map(
      (s, i) =>
        `### ${i + 1}. ${s.documentTitle} — *${s.sectionHeading}*\n\n${excerpt(s.content, 700)}`,
    )
    .join("\n\n");

  return {
    answer_markdown: `${prefix}\n\n${body}`,
    citations,
    confidence: "low",
    follow_up_questions: [],
  };
}

function enrichCitationsFromRetrieved(
  parsed: PolicyAskResponse,
  retrieved: PolicySection[],
): PolicyAskResponse {
  if (parsed.citations.length > 0) return parsed;
  return {
    ...parsed,
    citations: retrieved.map((s) => ({
      docId: s.docId,
      documentTitle: s.documentTitle,
      sectionHeading: s.sectionHeading,
      excerpt: excerpt(s.content, 220),
    })),
  };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (query.length < 3) {
    return NextResponse.json(
      { error: "Question too short (at least 3 characters)." },
      { status: 400 },
    );
  }
  if (query.length > 4000) {
    return NextResponse.json({ error: "Question too long (max 4000 chars)." }, { status: 400 });
  }

  const corpus = loadPolicyCorpus();
  if (corpus.length === 0) {
    return NextResponse.json(
      {
        error:
          "No policy corpus found. Add Markdown files under data/policies/ (e.g. acceptable-use.md).",
      },
      { status: 503 },
    );
  }

  const retrieved = retrievePolicySections(query, corpus, 8);
  const context = buildPolicyContextBlock(retrieved);
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    const out = fallbackFromSections(
      retrieved,
      "**Offline mode** — `GROQ_API_KEY` is not set. Showing retrieved policy excerpts only (no LLM synthesis).",
    );
    return NextResponse.json({
      ...out,
      llmUsed: false,
      mode: "excerpt_only",
    });
  }

  try {
    const groq = new Groq({ apiKey: key });
    const userPayload = `USER_QUESTION:\n${query}\n\nPOLICY_EXCERPTS:\n${context}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: POLICY_QA_SYSTEM_PROMPT },
        { role: "user", content: userPayload },
      ],
      temperature: 0.15,
      max_tokens: 900,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = tryParsePolicyAskJson(text);

    if (!parsed) {
      const out = fallbackFromSections(
        retrieved,
        "Groq returned output that could not be parsed as policy JSON. Below are the closest matching policy sections.",
      );
      return NextResponse.json({
        ...out,
        llmUsed: true,
        mode: "parse_error",
        rawPreview: excerpt(text, 400),
      });
    }

    const enriched = enrichCitationsFromRetrieved(parsed, retrieved);
    return NextResponse.json({
      ...enriched,
      llmUsed: true,
      mode: "llm",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Groq request failed";
    const out = fallbackFromSections(
      retrieved,
      `**LLM unavailable** (${msg}). Showing retrieved policy excerpts.`,
    );
    return NextResponse.json({
      ...out,
      llmUsed: false,
      mode: "error",
    });
  }
}
