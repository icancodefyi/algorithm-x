"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface RegistryEntry {
  reference_id: string;
  file_hash: string;
  image_fingerprint: string;
  created_at: number;
}

interface ProtectedImage extends RegistryEntry {
  preview: string;
  filename: string;
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export default function ProtectPage() {
  const [protected_, setProtected] = useState<ProtectedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("original_image", file);
      const res = await fetch(`${API_URL}/api/registry/`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "Registration failed");
      }
      const entry = await res.json() as RegistryEntry;

      // Build preview
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Avoid duplicates
      setProtected((prev) => {
        if (prev.some((p) => p.reference_id === entry.reference_id)) return prev;
        return [{ ...entry, preview, filename: file.name }, ...prev];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function copyHash(hash: string, id: string) {
    navigator.clipboard.writeText(hash).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Nav */}
      <header className="border-b border-[#e8e4de] px-6 py-4 flex items-center gap-3 bg-white sticky top-0 z-10">
        <Link href="/" className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity">
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <span className="text-[13px] text-[#9ca3af]">Protect Your Images</span>
        <div className="ml-auto">
          <Link
            href="/start"
            className="text-[12px] text-[#6b7280] hover:text-[#0a0a0a] border border-[#e8e4de] px-3 py-1.5 rounded-lg transition-colors"
          >
            Start Investigation
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <ShieldIcon className="text-emerald-600" />
            </div>
            <p className="font-mono text-[10px] text-[#a8a29e] uppercase tracking-widest">Original Image Registry</p>
          </div>
          <h1 className="text-[26px] font-bold text-[#0a0a0a] tracking-tight mb-3">
            Protect Your Images
          </h1>
          <p className="text-[13.5px] text-[#6b7280] leading-relaxed max-w-prose">
            Upload your original images to register their cryptographic fingerprint. If an identical image
            is later submitted for verification, our system will flag it as a match to your registered
            original — creating an immutable paper trail of ownership.
          </p>
        </div>

        {/* How it works — compact strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { step: "01", title: "Upload Original", body: "We compute a SHA-256 hash and perceptual fingerprint from your image bytes." },
            { step: "02", title: "Fingerprint Stored", body: "Your hash is stored in the registry. No image is kept — only the cryptographic proof." },
            { step: "03", title: "Match Detected", body: "Any future upload of the same image is flagged as matching your registered original." },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-[#e8e4de] bg-white px-4 py-4">
              <p className="font-mono text-[9px] text-[#c4bdb5] uppercase tracking-widest mb-2">{s.step}</p>
              <p className="text-[12px] font-semibold text-[#0a0a0a] mb-1">{s.title}</p>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer mb-4 ${
            dragging ? "border-emerald-400 bg-emerald-50" : "border-[#d4cfc9] bg-white hover:border-[#0a0a0a] hover:bg-[#fafaf8]"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {uploading ? (
              <>
                <div className="w-7 h-7 border-2 border-[#e8e4de] border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-[13px] text-[#9ca3af] font-mono">Registering fingerprint…</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[#f0efe9] border border-[#e8e4de] flex items-center justify-center mb-4">
                  <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
                    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-[#374151] mb-1">Drop image to protect</p>
                <p className="text-[11.5px] text-[#9ca3af]">JPG, PNG, WEBP · up to 10 MB · click to browse</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="text-[12px] text-red-600 mb-6 px-1">{error}</p>
        )}

        {/* Protected images list */}
        {protected_.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-4">
              Protected This Session ({protected_.length})
            </p>
            <div className="space-y-3">
              {protected_.map((img) => (
                <div key={img.reference_id} className="rounded-xl border border-[#e8e4de] bg-white overflow-hidden">
                  {/* Top bar */}
                  <div className="bg-[#f8faf8] border-b border-[#e8e4de] px-4 py-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-mono text-[10px] text-emerald-700 uppercase tracking-widest">Registered</span>
                    <span className="ml-auto font-mono text-[10px] text-[#c4bdb5]">{formatDate(img.created_at)}</span>
                  </div>

                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.preview}
                      alt={img.filename}
                      className="w-16 h-16 object-cover rounded-lg border border-[#e8e4de] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-[#0a0a0a] truncate mb-1">{img.filename}</p>
                      <p className="text-[10.5px] text-[#9ca3af] font-mono mb-2">
                        Ref: {img.reference_id.slice(0, 8).toUpperCase()}
                      </p>
                      {/* Hash row */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#6b7280] truncate">
                          {img.file_hash.slice(0, 16)}…{img.file_hash.slice(-8)}
                        </span>
                        <button
                          onClick={() => copyHash(img.file_hash, img.reference_id)}
                          className="shrink-0 text-[10px] font-mono text-[#9ca3af] hover:text-[#0a0a0a] border border-[#e8e4de] px-2 py-0.5 rounded transition-colors"
                        >
                          {copiedId === img.reference_id ? "Copied!" : "Copy hash"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Protection certificate footer */}
                  <div className="border-t border-[#f0ede8] bg-[#fafaf8] px-4 py-2.5 flex items-center gap-2">
                    <ShieldIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[10.5px] text-[#6b7280]">
                      If this image appears online, you can issue a cryptographic takedown notice from the{" "}
                      <Link href="/takedown" className="text-indigo-600 hover:underline">Takedown page</Link>.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {protected_.length === 0 && !uploading && (
          <div className="text-center py-8">
            <p className="text-[12px] text-[#c4bdb5] font-mono">No images registered yet this session</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 pt-8 border-t border-[#e8e4de] flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#9ca3af]">Found your image being misused online?</p>
          </div>
          <Link
            href="/takedown"
            className="inline-flex items-center gap-2 text-[12.5px] font-medium bg-[#0a0a0a] text-white px-4 py-2 rounded-full hover:bg-[#1a1a1a] transition-colors"
          >
            Issue Takedown Notice
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
