"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { DropZone } from "@/components/upload/DropZone";
import { AnalysisLoader } from "@/components/dashboard/AnalysisLoader";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const LOGO_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY ?? "pk_FRWLyzqbRcmEUk2DRouw0w";

const PLATFORMS: Array<{ label: string; domain: string }> = [
  { label: "Instagram",   domain: "instagram.com" },
  { label: "Twitter / X", domain: "x.com" },
  { label: "Telegram",    domain: "telegram.org" },
  { label: "Facebook",    domain: "facebook.com" },
  { label: "Reddit",      domain: "reddit.com" },
  { label: "TikTok",      domain: "tiktok.com" },
  { label: "WhatsApp",    domain: "whatsapp.com" },
  { label: "Snapchat",    domain: "snapchat.com" },
  { label: "Discord",     domain: "discord.com" },
  { label: "YouTube",     domain: "youtube.com" },
  { label: "Other",       domain: "" },
];

const ISSUE_TYPES = [
  { value: "AI-generated deepfake", label: "AI-generated deepfake" },
  { value: "Face swap / manipulation", label: "Face swap / manipulation" },
  { value: "Edited or altered image", label: "Edited or altered image" },
  { value: "Other manipulation", label: "Other" },
];

function PlatformLogo({ domain, size = 20 }: { domain: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!domain || failed) return null;
  return (
    <NextImage
      src={`https://img.logo.dev/${domain}?token=${LOGO_KEY}&size=32`}
      alt={domain}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="rounded object-contain shrink-0"
      unoptimized
    />
  );
}

async function storePreview(src: string, key: string) {
  try {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = src;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      setTimeout(() => resolve(), 3000);
    });
    if (!img.width) return;
    canvas.width = Math.min(img.width, 480);
    canvas.height = Math.round((canvas.width / img.width) * img.height);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    sessionStorage.setItem(key, canvas.toDataURL("image/jpeg", 0.75));
  } catch { /* non-critical */ }
}

function UploadContent() {
  const router = useRouter();
  const { t } = useTranslation();

  // Case details
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [issueType, setIssueType] = useState("AI-generated deepfake");

  // Files
  const [suspiciousFile, setSuspiciousFile] = useState<File | null>(null);
  const [suspiciousPreview, setSuspiciousPreview] = useState<string | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  // State
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(
    file: File,
    setter: (f: File) => void,
    previewSetter: (s: string) => void,
  ) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setError(null);
    setter(file);
    previewSetter(URL.createObjectURL(file));
  }

  async function startAnalysis() {
    if (!suspiciousFile) return;
    setAnalyzing(true);
    setError(null);

    try {
      // 1. Create case
      const caseRes = await fetch(`${API_URL}/api/cases/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous: true,
          platform_source: platform.label,
          issue_type: issueType,
          pipeline_type: "deepfake",
        }),
      });
      if (!caseRes.ok) {
        const err = await caseRes.json().catch(() => ({})) as { detail?: string };
        throw new Error(err.detail || "Failed to create case");
      }
      const { case_id: caseId } = await caseRes.json() as { case_id: string };

      // 2. Store previews for the report pages
      if (suspiciousPreview) await storePreview(suspiciousPreview, `sniffer_suspicious_${caseId}`);
      if (referencePreview) await storePreview(referencePreview, `sniffer_reference_${caseId}`);
      if (evidencePreview) await storePreview(evidencePreview, `sniffer_evidence_${caseId}`);

      // 3. Run analysis
      const formData = new FormData();
      formData.append("suspicious_image", suspiciousFile);
      if (referenceFile) formData.append("reference_image", referenceFile);
      if (evidenceFile) formData.append("evidence_image", evidenceFile);

      const analysisRes = await fetch(`${API_URL}/api/analysis/${caseId}/run`, {
        method: "POST",
        body: formData,
      });
      if (!analysisRes.ok) {
        const err = await analysisRes.json().catch(() => ({})) as { detail?: string };
        throw new Error(err.detail || "Analysis failed");
      }

      // 4. Kick off discovery scan in background (non-blocking)
      const discoveryData = new FormData();
      discoveryData.append("suspicious_image", suspiciousFile);
      void fetch(`${API_URL}/api/analysis/${caseId}/discover`, {
        method: "POST",
        body: discoveryData,
      }).catch(() => {});

      // 5. Navigate — AnalysisLoader stays visible until route change
      router.push(`/report/${caseId}/analysis`);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Full-screen analysis loader overlay */}
      {analyzing && (
        <AnalysisLoader image={suspiciousPreview || ""} onComplete={() => {}} />
      )}

      <header className="border-b border-[#e8e4de] px-6 py-4 flex items-center gap-3 bg-white">
        <Link
          href="/"
          className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity"
        >
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <Link href="/start" className="text-[13px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors">
          Start
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <span className="text-[13px] text-[#9ca3af]">{t.upload.breadcrumb}</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="font-mono text-[10px] text-indigo-600 uppercase tracking-widest">
              Deepfake · Forensic Analysis
            </span>
          </div>
          <h1
            className="text-3xl text-[#0a0a0a] leading-snug mb-2"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            {t.upload.heading}
          </h1>
          <p className="text-[14px] text-[#6b7280]">
            {t.upload.subheading}
          </p>
        </div>

        {/* ── Section 1: Case Details ─────────────────────────────── */}
        <div className="mb-6 rounded-xl border border-[#e8e4de] bg-white px-5 py-5">
          <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-4">
            Case Details
          </p>

          {/* Platform pills */}
          <div className="mb-5">
            <p className="text-[11.5px] text-[#6b7280] mb-2.5">Where did the content appear?</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const active = platform.label === p.label;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12.5px] font-medium transition-all ${
                      active
                        ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                        : "border-[#e8e4de] text-[#374151] hover:border-[#9ca3af] bg-white"
                    }`}
                  >
                    {p.domain && (
                      <span className="shrink-0 rounded overflow-hidden" style={{ width: 16, height: 16, display: "flex", alignItems: "center" }}>
                        <PlatformLogo domain={p.domain} size={16} />
                      </span>
                    )}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issue type */}
          <div>
            <p className="text-[11.5px] text-[#6b7280] mb-2.5">Type of manipulation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ISSUE_TYPES.map((it) => (
                <button
                  key={it.value}
                  type="button"
                  onClick={() => setIssueType(it.value)}
                  className={`text-left px-4 py-2.5 rounded-xl border text-[13px] transition-all flex items-center justify-between ${
                    issueType === it.value
                      ? "border-indigo-300 bg-indigo-50 text-[#0a0a0a]"
                      : "border-[#e8e4de] bg-white text-[#374151] hover:border-[#9ca3af]"
                  }`}
                >
                  {it.label}
                  {issueType === it.value && (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 ml-2">
                      <svg width="8" height="8" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 2: Upload Images ────────────────────────────── */}
        <div className="mb-6 rounded-xl border border-[#e8e4de] bg-white px-5 py-5">
          <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-4">
            Upload Images
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Suspicious — required */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#0a0a0a] uppercase tracking-widest font-semibold">
                  Suspicious Image
                </span>
                <span className="text-[10px] font-mono text-red-500 uppercase">Required</span>
              </div>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                The image you suspect has been manipulated or AI-generated.
              </p>
              <DropZone
                file={suspiciousFile}
                preview={suspiciousPreview}
                onFile={(f) => handleFile(f, setSuspiciousFile, setSuspiciousPreview)}
                onClear={() => { setSuspiciousFile(null); setSuspiciousPreview(null); }}
                label="Drop suspicious image"
                compact
              />
            </div>

            {/* Reference — optional */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#6b7280] uppercase tracking-widest">
                  Reference Image
                </span>
                <span className="text-[10px] font-mono text-[#c4bdb5] uppercase">Optional</span>
              </div>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                Known-authentic original for pixel-level comparison.
              </p>
              <DropZone
                file={referenceFile}
                preview={referencePreview}
                onFile={(f) => handleFile(f, setReferenceFile, setReferencePreview)}
                onClear={() => { setReferenceFile(null); setReferencePreview(null); }}
                label="Drop reference image"
                compact
              />
            </div>

            {/* Evidence — optional */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#6b7280] uppercase tracking-widest">
                  Supporting Evidence
                </span>
                <span className="text-[10px] font-mono text-[#c4bdb5] uppercase">Optional</span>
              </div>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                Screenshot showing where the content appeared online.
              </p>
              <DropZone
                file={evidenceFile}
                preview={evidencePreview}
                onFile={(f) => handleFile(f, setEvidenceFile, setEvidencePreview)}
                onClear={() => { setEvidenceFile(null); setEvidencePreview(null); }}
                label="Drop screenshot evidence"
                compact
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between">
          <Link
            href="/start"
            className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
          >
            ← Back
          </Link>
          <button
            type="button"
            onClick={startAnalysis}
            disabled={!suspiciousFile || analyzing}
            className="px-8 py-3 bg-[#0a0a0a] text-white text-[13px] font-semibold rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              `${t.upload.analyzeButton} →`
            )}
          </button>
        </div>

        {!suspiciousFile && (
          <p className="text-center text-[11.5px] text-[#c4bdb5] mt-4 font-mono">
            Upload the suspicious image above to enable analysis
          </p>
        )}
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense>
      <UploadContent />
    </Suspense>
  );
}
