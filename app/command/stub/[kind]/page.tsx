import Link from "next/link";
import { notFound } from "next/navigation";

const STUBS: Record<string, { title: string; blurb: string }> = {
  phishing: {
    title: "Spear-phishing detection",
    blurb: "Email, message body, and URL analysis will plug into the unified alert feed in the next build phase.",
  },
  malware: {
    title: "Malware analysis",
    blurb: "File and hash inspection with polymorphic / adversarial framing will land here next.",
  },
  vulnerabilities: {
    title: "Vulnerability prioritization",
    blurb: "CVE data plus asset context and explainable ranking will be implemented in a following phase.",
  },
  policy: {
    title: "Policy Q&A",
    blurb: "Natural-language queries over security policy documents with citations will be added next.",
  },
  countermeasures: {
    title: "Countermeasures lab",
    blurb: "Deceptive responses and traffic simulation will connect to the generative layer in a later phase.",
  },
};

export default async function CommandStubPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const meta = STUBS[kind];
  if (!meta) notFound();

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col">
      <header className="border-b border-[#e8e4de] px-4 sm:px-8 py-4 bg-white">
        <Link
          href="/command"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-800"
        >
          ← Security Command
        </Link>
      </header>
      <main className="flex-1 max-w-lg mx-auto px-6 py-12 sm:py-16">
        <div className="rounded-xl border border-[#e8e4de] bg-white p-8 shadow-sm">
          <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-[0.25em] mb-3">Module</p>
          <h1
            className="text-2xl text-[#0a0a0a] mb-4 leading-snug"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            {meta.title}
          </h1>
          <p className="text-[14px] text-[#6b7280] leading-relaxed mb-8">{meta.blurb}</p>
          <Link
            href="/command"
            className="inline-flex text-[13px] font-medium text-white bg-[#0a0a0a] rounded-full px-6 py-2.5 hover:bg-[#1a1a1a] transition-colors"
          >
            Back to Command
          </Link>
        </div>
      </main>
    </div>
  );
}
