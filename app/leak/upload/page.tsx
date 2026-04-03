"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DropZone } from "@/components/upload/DropZone";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const SCAN_STEPS = [
  "Fingerprinting image for network scan",
  "Scanning monitored domains",
  "Comparing thumbnails and preview assets",
  "Mapping hosting networks and CDN",
  "Compiling evidence and removal contacts",
];

function LeakUploadContent() {
  const router = useRouter();
  const params = useSearchParams();
  const caseId = params.get("caseId");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) router.replace("/leak");
  }, [caseId, router]);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleEvidenceFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file for supporting evidence.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Evidence file must be under 10 MB.");
      return;
    }
    setError(null);
    setEvidenceFile(f);
    setEvidencePreview(URL.createObjectURL(f));
  }

  async function storePreview(src: string, key: string) {
    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = src;
      await new Promise<void>((res) => { img.onload = () => res(); });
      canvas.width = Math.min(img.width, 480);
      canvas.height = Math.round((canvas.width / img.width) * img.height);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      sessionStorage.setItem(key, canvas.toDataURL("image/jpeg", 0.75));
    } catch {
      // non-critical
    }
  }

  async function startScan() {
    if (!file || !caseId) return;
    setScanning(true);
    setScanStep(0);
    setProcessing(false);
    setError(null);

    if (preview) await storePreview(preview, `sniffer_suspicious_${caseId}`);
    if (evidencePreview) await storePreview(evidencePreview, `sniffer_evidence_${caseId}`);

    const interval = setInterval(() => {
      setScanStep((s) => {
        if (s >= SCAN_STEPS.length - 1) { clearInterval(interval); return s; }
        return s + 1;
      });
    }, 900);

    const minDelay = new Promise<void>((res) => setTimeout(res, 4500));

    try {
      const formData = new FormData();
      formData.append("suspicious_image", file);
      if (evidenceFile) {
        formData.append("evidence_image", evidenceFile);
      }

      const [res] = await Promise.all([
        fetch(`${API_URL}/api/analysis/${caseId}/discover`, {
          method: "POST",
          body: formData,
        }),
        minDelay,
      ]);

      clearInterval(interval);
      setScanStep(SCAN_STEPS.length - 1);

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(err.detail || "Scan failed to start");
      }

      // Show processing screen for 5 seconds
      setScanning(false);
      setProcessing(true);
      await new Promise<void>((res) => setTimeout(res, 5000));
      router.push(`/report/${caseId}`);
    } catch (e) {
      clearInterval(interval);
      setScanning(false);
      setProcessing(false);
      setError(e instanceof Error ? e.message : "Scan failed. Please try again.");
    }
  }

  if (!caseId) return null;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Nav */}
      <header className="border-b border-[#e8e4de] px-6 py-4 flex items-center gap-3 bg-white">
        <Link href="/" className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity">
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <Link href="/leak" className="text-[13px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors">
          Leak Investigation
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <span className="font-mono text-[12px] text-[#9ca3af]">{caseId.slice(0, 8).toUpperCase()}</span>
      </header>

      {/* Scanning overlay */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-sm w-full mx-6 rounded-2xl border border-[#e8e4de] bg-white px-8 py-10 text-center shadow-xl">
            {/* Pulse ring */}
            <div className="relative mx-auto mb-6 w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-rose-100 animate-ping opacity-60" />
              <div className="relative w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f43f5e" strokeWidth="1.75">
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" />
                  <path d="M2 12h4M18 12h4M12 2v4M12 18v4" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            </div>
            <p className="font-mono text-[10px] text-rose-500 uppercase tracking-widest mb-2">Pipeline 2 · Leak Scan</p>
            <p className="text-[18px] font-semibold text-[#0a0a0a] mb-1 leading-snug">
              Scanning the network
            </p>
            <p className="text-[12.5px] text-[#6b7280] mb-7 leading-relaxed">
              Fingerprinting your image and checking known domains for visual matches.
            </p>
            {/* Step list */}
            <div className="text-left space-y-2.5">
              {SCAN_STEPS.map((label, i) => (
                <div key={label} className={`flex items-center gap-2.5 transition-opacity ${i > scanStep ? "opacity-30" : "opacity-100"}`}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    i < scanStep ? "bg-rose-500 border-rose-500" : i === scanStep ? "border-rose-400 bg-rose-50" : "border-[#e8e4de]"
                  }`}>
                    {i < scanStep && (
                      <svg width="7" height="7" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {i === scanStep && (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[12px] ${i === scanStep ? "text-[#0a0a0a] font-medium" : "text-[#6b7280]"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {processing && (
        <div className="fixed inset-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-7 h-7 border-2 border-[#e8e4de] border-t-[#0a0a0a] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[13px] text-[#9ca3af] font-mono">Preparing your report…</p>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Pipeline badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span className="font-mono text-[10px] text-rose-600 uppercase tracking-widest">Pipeline 2 · NCII Leak Discovery</span>
        </div>

        <h1
          className="text-3xl text-[#0a0a0a] leading-snug mb-2"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Upload the image to trace
        </h1>
        <p className="text-sm text-[#6b7280] mb-8 max-w-prose">
          We&apos;ll generate a perceptual fingerprint and scan across monitored domains for visual matches. 
          No original image needed — this works on any copy of the content.
        </p>

        <DropZone
          file={file}
          preview={preview}
          onFile={handleFile}
          onClear={() => { setFile(null); setPreview(null); }}
        />

        {/* What happens next */}
        {!file && (
          <div className="mt-6 rounded-xl border border-[#e8e4de] bg-white p-5">
            <p className="text-[11px] font-mono text-[#a8a29e] uppercase tracking-widest mb-3">What happens after upload</p>
            <div className="space-y-2.5">
              {[
                { n: "1", text: "Image is fingerprinted (pHash + SHA-256) — never stored permanently" },
                { n: "2", text: "Network scan checks thumbnails and preview assets across known domains" },
                { n: "3", text: "Visual matches are clustered by hosting network and CDN" },
                { n: "4", text: "Report shows removal contacts, DMCA links, and abuse email addresses" },
              ].map((item) => (
                <div key={item.n} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full border border-[#e8e4de] bg-[#fafaf8] flex items-center justify-center font-mono text-[9px] text-[#9ca3af] shrink-0 mt-0.5">
                    {item.n}
                  </span>
                  <p className="text-[12.5px] text-[#6b7280] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supporting Evidence upload */}
        {file && (
          <div className="mt-6 rounded-xl border border-[#e8e4de] bg-white p-5">
            <p className="text-[11px] font-mono text-[#a8a29e] uppercase tracking-widest mb-1">
              Supporting Evidence <span className="text-[#c4bdb5]">— optional</span>
            </p>
            <p className="text-[12px] text-[#6b7280] mb-4 leading-relaxed">
              Upload a screenshot showing where this content appeared — a Telegram message, social media post, or website. 
              Helps identify the leak source faster.
            </p>
            {evidenceFile ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-[#e8e4de] bg-[#fafaf8]">
                {evidencePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={evidencePreview} alt="Evidence" className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#0a0a0a] truncate">{evidenceFile.name}</p>
                  <p className="text-[11px] text-[#9ca3af]">Supporting evidence uploaded</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setEvidenceFile(null); setEvidencePreview(null); }}
                  className="text-[11px] text-[#9ca3af] hover:text-red-500 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-[#e8e4de] bg-[#fafaf8] cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#f0ede8] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9l4-4 4 4 4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[12px] text-[#6b7280]">Click to upload a screenshot or drag one here</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEvidenceFile(f); }}
                />
              </label>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mt-8">
          <Link href="/leak" className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors">
            ← Back
          </Link>
          <button
            type="button"
            onClick={startScan}
            disabled={!file || scanning}
            className="px-6 py-2.5 bg-rose-500 text-white text-[13px] font-medium rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors flex items-center gap-2"
          >
            {scanning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              "Start Leak Scan →"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function LeakUploadPage() {
  return (
    <Suspense>
      <LeakUploadContent />
    </Suspense>
  );
}
