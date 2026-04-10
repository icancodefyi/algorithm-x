"use client";

import Link from "next/link";
import { useState } from "react";
import {
  INCIDENT_TYPE_LABELS,
  type IncidentType,
} from "@/types/security-complaint";

const INCIDENT_KEYS = Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[];

export default function StructuredComplaintPage() {
  const [incidentType, setIncidentType] = useState<IncidentType>("spear_phishing");
  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState("");
  const [platformOrChannel, setPlatformOrChannel] = useState("");
  const [relatedCaseId, setRelatedCaseId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [consentFollowup, setConsentFollowup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    complaintRef: string;
    nextSteps: string[];
  } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/security/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType,
          title: title.trim() || undefined,
          narrative,
          evidenceUrls,
          platformOrChannel,
          relatedCaseId: relatedCaseId.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          consentFollowup,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        complaintRef?: string;
        nextSteps?: string[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Submit failed");
        return;
      }
      if (json.complaintRef && json.nextSteps) {
        setSuccess({ complaintRef: json.complaintRef, nextSteps: json.nextSteps });
        setNarrative("");
        setTitle("");
        setEvidenceUrls("");
        setPlatformOrChannel("");
        setRelatedCaseId("");
        setContactEmail("");
        setConsentFollowup(false);
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function copyRef() {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.complaintRef);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="border-b border-[#e8e4de] px-4 sm:px-8 py-4 flex flex-wrap items-center gap-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/"
            className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity"
          >
            Sniffer
          </Link>
          <span className="text-[#d4cfc9]">/</span>
          <Link
            href="/command"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-800"
          >
            Command
          </Link>
          <span className="text-[#d4cfc9]">/</span>
          <span className="text-[13px] text-[#9ca3af]">Structured complaint</span>
        </div>
        <Link
          href="/command"
          className="text-[12px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors border border-[#e8e4de] px-3 py-1.5 rounded-lg shrink-0"
        >
          Back to Command
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span className="font-mono text-[10px] text-rose-700 uppercase tracking-widest">
              Detect → document → act
            </span>
          </div>
          <h1
            className="text-3xl text-[#0a0a0a] leading-snug mb-2"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            File a structured complaint
          </h1>
          <p className="text-[14px] text-[#6b7280] leading-relaxed">
            Use this when you are <strong className="font-medium text-[#374151]">not</strong> coming from an analysis page. For phishing and vulnerability
            prioritization, prefer <strong className="font-medium text-[#374151]">the same screen as the analysis</strong> so evidence is bundled automatically.
            Here you write everything from scratch. You still get a <strong className="font-medium text-[#374151]">reference ID</strong> and next steps.
            Requires <code className="text-[12px] bg-[#f0ede8] px-1 rounded">MONGODB_URI</code>.
          </p>
        </div>

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-800">Submitted</p>
            <p className="text-[15px] text-[#0a0a0a]">
              Your reference:{" "}
              <span className="font-mono font-semibold text-emerald-900">{success.complaintRef}</span>
            </p>
            <button
              type="button"
              onClick={() => void copyRef()}
              className="text-[12px] font-mono border border-emerald-300 px-3 py-1.5 rounded-lg text-emerald-900 hover:bg-emerald-100"
            >
              Copy reference
            </button>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 mb-2">
                Suggested next steps
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#374151]">
                {success.nextSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/verify/upload"
                className="text-[12px] font-medium text-indigo-700 hover:text-indigo-900"
              >
                Run media verification →
              </Link>
              <span className="text-[#d4cfc9]">|</span>
              <Link
                href="/command/phishing"
                className="text-[12px] font-medium text-indigo-700 hover:text-indigo-900"
              >
                Phishing triage →
              </Link>
              <span className="text-[#d4cfc9]">|</span>
              <Link href="/command" className="text-[12px] font-medium text-indigo-700 hover:text-indigo-900">
                Security Command →
              </Link>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => void submit(e)}
          className="rounded-xl border border-[#e8e4de] bg-white p-5 sm:p-6 shadow-sm space-y-5"
        >
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              Incident type
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as IncidentType)}
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] text-[#0a0a0a] bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            >
              {INCIDENT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {INCIDENT_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              Short title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fake invoice from CFO lookalike domain"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              What happened? (required, min ~40 characters)
            </label>
            <textarea
              required
              minLength={40}
              maxLength={12000}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={8}
              placeholder="Timeline, who contacted you, what they asked for, any amounts or account handles…"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-rose-200 resize-y min-h-[180px]"
            />
            <p className="text-[11px] text-[#9ca3af] mt-1">{narrative.length} / 12000</p>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              Evidence URLs (optional, one per line)
            </label>
            <textarea
              value={evidenceUrls}
              onChange={(e) => setEvidenceUrls(e.target.value)}
              rows={4}
              placeholder="https://…"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[13px] font-mono text-[#374151] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-rose-200 resize-y"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              Platform or channel
            </label>
            <input
              type="text"
              value={platformOrChannel}
              onChange={(e) => setPlatformOrChannel(e.target.value)}
              placeholder="e.g. Work email, WhatsApp, Instagram"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              Related Sniffer case ID (optional)
            </label>
            <input
              type="text"
              value={relatedCaseId}
              onChange={(e) => setRelatedCaseId(e.target.value)}
              placeholder="If you already ran verification, paste case id"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] font-mono text-[#374151] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] mb-2">
              Contact email (optional)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="If you consent to follow-up from your team"
              className="w-full rounded-xl border border-[#e8e4de] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentFollowup}
              onChange={(e) => setConsentFollowup(e.target.checked)}
              className="mt-1 rounded border-[#e8e4de]"
            />
            <span className="text-[13px] text-[#6b7280]">
              I understand this form is for documentation and triage; it does not replace law enforcement or
              platform abuse forms. I consent to storing this submission for incident handling.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy || !consentFollowup || narrative.trim().length < 40}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? "Submitting…" : "Submit structured complaint"}
          </button>
          {!consentFollowup && (
            <p className="text-[11px] text-[#9ca3af]">Check the consent box to enable submit.</p>
          )}
        </form>
      </main>
    </div>
  );
}
