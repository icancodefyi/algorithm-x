"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const SOURCES = [
  { value: "Telegram", label: "Telegram", desc: "Private channel or group" },
  { value: "Instagram", label: "Instagram", desc: "Story, post, or reel" },
  { value: "Twitter / X", label: "Twitter / X", desc: "Post or direct message" },
  { value: "Reddit", label: "Reddit", desc: "Post or community share" },
  { value: "mydesi.ltd", label: "mydesi.ltd", desc: "Adult content domain" },
  { value: "fsiblog.pro", label: "fsiblog.pro", desc: "Adult content domain" },
  { value: "Other website", label: "Other website", desc: "Any other platform or URL" },
];

export default function LeakPage() {
  const router = useRouter();
  const [source, setSource] = useState("Telegram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/cases/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous: true,
          platform_source: source,
          issue_type: "Non-consensual image sharing",
          pipeline_type: "ncii",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || "Failed to create case");
      }
      const json = await res.json() as { case_id: string };
      void fetch("/api/claim/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "case_created",
          caseId: json.case_id,
          platformSource: source,
          issueType: "Non-consensual image sharing",
          pipelineType: "ncii",
          anonymous: true,
        }),
        keepalive: true,
      }).catch(() => {});
      router.push(`/leak/upload?caseId=${json.case_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#f0ede8] px-6 py-4 flex items-center gap-3">
        <Link href="/" className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity">
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <Link href="/start" className="text-[13px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors">
          Start
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <span className="text-[13px] text-[#9ca3af]">Leak Discovery</span>
      </header>

      <main className="max-w-xl mx-auto px-6 py-14">
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span className="font-mono text-[10px] text-rose-600 uppercase tracking-widest">NCII · Leak Discovery</span>
        </div>

        <h1
          className="text-3xl text-[#0a0a0a] leading-snug mt-4 mb-2"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Where was the content found?
        </h1>
        <p className="text-[14px] text-[#6b7280] mb-8">
          Select the platform where you found the leak. We&apos;ll scan that network and connected domains for visual matches.
        </p>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-mono text-[#a8a29e] uppercase tracking-widest mb-3">
              Source platform
            </label>
            <div className="flex flex-col gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSource(s.value)}
                  className={`text-left p-4 border rounded-xl transition-all flex items-center justify-between gap-4 ${
                    source === s.value
                      ? "border-rose-400 bg-rose-50 ring-1 ring-rose-100"
                      : "border-[#e8e4de] bg-white hover:border-[#9ca3af]"
                  }`}
                >
                  <div>
                    <span className="block text-[14px] font-semibold text-[#0a0a0a]">{s.label}</span>
                    <span className="block text-[12px] text-[#9ca3af] mt-0.5">{s.desc}</span>
                  </div>
                  {source === s.value && (
                    <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                      <svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link href="/start" className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors">
              ← Back
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 bg-rose-500 text-white text-[13px] font-medium rounded-full disabled:opacity-40 hover:bg-rose-600 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating case…
                </>
              ) : (
                "Upload Image →"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
