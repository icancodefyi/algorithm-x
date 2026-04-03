"use client";

import { useRef, useState } from "react";

interface Props {
  file: File | null;
  preview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
  label?: string;
  compact?: boolean;
}

export function DropZone({
  file,
  preview,
  onFile,
  onClear,
  label = "Drag & drop your image here",
  compact = false,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => {
        if (!file) inputRef.current?.click();
      }}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all ${
        dragging
          ? "border-indigo-400 bg-indigo-50"
          : file
          ? "border-[#e8e4de] bg-white"
          : "border-[#d4cfc9] bg-white hover:border-[#0a0a0a] hover:bg-[#fafaf8] cursor-pointer"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {file && preview ? (
        <div
          className={`flex gap-4 items-start ${compact ? "p-4" : "p-6"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Upload preview"
            className={`object-cover rounded-xl border border-[#e8e4de] shrink-0 ${
              compact ? "w-16 h-16" : "w-24 h-24"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#0a0a0a] truncate">{file.name}</p>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">
              {(file.size / 1024).toFixed(0)} KB · {file.type.split("/")[1].toUpperCase()}
            </p>
            <button
              type="button"
              onClick={onClear}
              className="mt-2 text-[12px] text-red-500 hover:text-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg width="10" height="10" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center gap-3 px-6 text-center ${
            compact ? "py-12 gap-2" : "py-16 gap-3"
          }`}
        >
          {!compact && (
            <div className="w-12 h-12 rounded-xl border border-[#e8e4de] flex items-center justify-center bg-[#fafaf8]">
              <svg width="22" height="22" fill="none" stroke="#a8a29e" strokeWidth="1.5" viewBox="0 0 24 24">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          {compact && (
            <svg width="22" height="22" fill="none" stroke="#a8a29e" strokeWidth="1.5" viewBox="0 0 24 24">
              <path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <div>
            <p className="text-[14px] font-medium text-[#374151]">
              {dragging ? "Drop to upload" : label}
            </p>
            {!compact && <p className="text-[12px] text-[#9ca3af] mt-1">or click to browse files</p>}
          </div>
          <p className="text-[11px] text-[#c4bdb5] font-mono">
            {compact ? "JPG · PNG · WEBP" : "JPG · PNG · WEBP · MAX 10 MB"}
          </p>
        </div>
      )}
    </div>
  );
}
