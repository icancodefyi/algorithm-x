"use client";

import { DropZone } from "./DropZone";

interface Props {
  suspiciousPreview: string | null;
  referenceFile: File | null;
  referencePreview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string | null;
}

export function ReferenceUploadPhase({
  suspiciousPreview,
  referenceFile,
  referencePreview,
  onFile,
  onClear,
  onSubmit,
  onBack,
  error,
}: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] text-indigo-500 uppercase tracking-widest mb-3">Original Image</p>
      <h1
        className="text-3xl text-[#0a0a0a] leading-snug mb-2"
        style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
      >
        Upload the original image
      </h1>
      <p className="text-sm text-[#6b7280] mb-6">
        Compared against the suspicious image pixel-by-pixel to detect manipulation regions.
      </p>

      {/* Side-by-side comparison strip */}
      {suspiciousPreview && (
        <div className="mb-5 p-4 border border-[#e8e4de] rounded-xl bg-white flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={suspiciousPreview}
            alt="Suspicious image"
            className="w-14 h-14 object-cover rounded-lg border border-[#e8e4de] shrink-0"
          />
          <div className="flex-1 text-center">
            <span className="block text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest">vs</span>
          </div>
          <div
            className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed ${
              referenceFile ? "border-[#e8e4de]" : "border-[#d4cfc9]"
            }`}
          >
            {referencePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={referencePreview} alt="Reference image" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9px] text-[#c4bdb5] font-mono text-center leading-tight px-1">
                ADD
                <br />
                ORIG
              </span>
            )}
          </div>
        </div>
      )}

      <DropZone
        file={referenceFile}
        preview={referencePreview}
        onFile={onFile}
        onClear={onClear}
        label="Upload original image"
        compact
      />

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!referenceFile}
          className="px-6 py-2.5 bg-[#0a0a0a] text-white text-[13px] font-medium rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
        >
          Run Forensic Analysis →
        </button>
      </div>
    </div>
  );
}
