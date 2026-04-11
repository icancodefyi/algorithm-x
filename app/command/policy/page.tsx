"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PolicyAskResponse } from "@/types/policy-qa";

type CorpusMeta = {
  ok: boolean;
  source: string;
  sectionCount: number;
  documents: Array<{ docId: string; documentTitle: string; sectionCount: number }>;
};

type AskApiResponse = PolicyAskResponse & {
  llmUsed: boolean;
  mode?: string;
  rawPreview?: string;
  error?: string;
};

function confidenceBadge(c: PolicyAskResponse["confidence"]): string {
  switch (c) {
    case "high":
      return "bg-emerald-50 text-emerald-900 border-emerald-200";
    case "medium":
      return "bg-amber-50 text-amber-900 border-amber-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export default function PolicyQAPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskApiResponse | null>(null);
  const [corpus, setCorpus] = useState<CorpusMeta | null>(null);

  const loadCorpus = useCallback(async () => {
    try {
      const res = await fetch("/api/security/policy");
      const json = (await res.json()) as CorpusMeta & { error?: string };
      if (res.ok) setCorpus(json);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadCorpus();
  }, [loadCorpus]);

  async function ask() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/security/policy/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = (await res.json()) as AskApiResponse;
      if (!res.ok) {
        setError(json.error ?? "Request failed");
        return;
      }
      setResult(json);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Security Command
            </p>
            <h1 className="text-xl font-semibold text-zinc-900">Policy Q&amp;A</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Answers are grounded in Markdown policies under{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">data/policies/</code>.
              Add more <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">.md</code> files
              to grow the knowledge base.
            </p>
          </div>
          <Link
            href="/command"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            ← Command
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {corpus && (
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-800">Loaded corpus</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {corpus.sectionCount} sections from {corpus.documents.length} documents (
              {corpus.source})
            </p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-700">
              {corpus.documents.map((d) => (
                <li key={d.docId}>
                  <span className="font-medium">{d.documentTitle}</span>
                  <span className="text-zinc-500">
                    {" "}
                    — {d.sectionCount} section{d.sectionCount === 1 ? "" : "s"} (
                    <code className="text-xs">{d.docId}</code>)
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <label htmlFor="policy-q" className="text-sm font-medium text-zinc-800">
            Your question
          </label>
          <textarea
            id="policy-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            placeholder="e.g. Is MFA mandatory for VPN? What do I do if I lose a laptop?"
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void ask()}
              disabled={loading || query.trim().length < 3}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {loading ? "Asking…" : "Ask policy"}
            </button>
            <span className="text-xs text-zinc-500">
              Retrieval picks top sections; Groq applies the analyst system prompt and returns JSON
              with citations.
            </span>
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        {result && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${confidenceBadge(result.confidence)}`}
              >
                Confidence: {result.confidence}
              </span>
              {result.llmUsed ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-900">
                  Groq synthesis
                </span>
              ) : (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-900">
                  Excerpt mode
                </span>
              )}
              {result.mode && result.mode !== "llm" && (
                <span className="text-xs text-zinc-500">({result.mode})</span>
              )}
            </div>

            <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-800">Answer</h2>
              <div className="prose-policy mt-3 text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">
                {result.answer_markdown}
              </div>
              {result.rawPreview && (
                <p className="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                  Raw preview: {result.rawPreview}
                </p>
              )}
            </article>

            <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-800">Citations</h2>
              {result.citations.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">No citations returned.</p>
              ) : (
                <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-zinc-800">
                  {result.citations.map((c, i) => (
                    <li key={`${c.docId}-${c.sectionHeading}-${i}`}>
                      <p className="font-medium">
                        {c.documentTitle}{" "}
                        <span className="font-normal text-zinc-500">
                          — {c.sectionHeading} ({c.docId})
                        </span>
                      </p>
                      <blockquote className="mt-1 border-l-2 border-zinc-300 pl-3 text-zinc-600">
                        {c.excerpt}
                      </blockquote>
                    </li>
                  ))}
                </ol>
              )}
            </article>

            {result.follow_up_questions && result.follow_up_questions.length > 0 && (
              <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-800">Follow-up ideas</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {result.follow_up_questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </article>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
