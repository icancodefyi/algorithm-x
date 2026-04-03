"use client";

import { useState } from "react";

interface Props {
  suspiciousImg: string | null;
  referenceImg: string | null;
  tamperHeatmap?: string | null;
  compact?: boolean;
}

function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest">{label}</p>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full max-h-[80vh] object-contain rounded-xl border border-white/10" />
      </div>
    </div>
  );
}

function ImagePanel({ src, label, badge, height = "h-52" }: { src: string | null; label: string; badge?: string; height?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && src && <Lightbox src={src} label={label} onClose={() => setOpen(false)} />}
      <div className="flex flex-col">
        <div
          className={`group ${height} rounded-xl border border-[#e8e4de] bg-[#f5f3f0] overflow-hidden flex items-center justify-center relative ${
            src ? "cursor-pointer" : ""
          } transition-shadow hover:shadow-md`}
          onClick={() => src && setOpen(true)}
        >
          <span className="absolute top-2.5 left-2.5 bg-white/95 text-[#374151] text-[8px] font-mono px-2 py-0.5 rounded-md tracking-[0.15em] uppercase border border-[#e8e4de] z-10 font-semibold">
            {label}
          </span>
          {src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 rounded-full p-2.5 shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center px-4">
              <svg width="24" height="24" fill="none" stroke="#d4cfc9" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto mb-2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-[9px] text-[#c4bdb5] font-mono uppercase tracking-widest">
                {label === "Reference" ? "Not provided" : "Not cached"}
              </p>
            </div>
          )}
          {badge && (
            <span className="absolute top-2.5 right-2.5 bg-[#0a0a0a] text-white text-[8px] font-mono px-2 py-0.5 rounded-md tracking-[0.15em] uppercase font-semibold">
              {badge}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export function ImageEvidence({ suspiciousImg, referenceImg, tamperHeatmap, compact }: Props) {
  const hasTamper = Boolean(tamperHeatmap);
  const panelHeight = compact ? "h-40" : "h-52";
  const gridClass = hasTamper
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    : "grid grid-cols-1 sm:grid-cols-2 gap-3";

  return (
    <div>
      <p className="text-[9px] font-mono text-[#c4bdb5] uppercase tracking-[0.2em] mb-3 font-semibold">Image Evidence</p>
      <div className={gridClass}>
        <ImagePanel src={suspiciousImg} label="Suspicious" height={panelHeight} />
        <ImagePanel src={referenceImg} label="Reference" height={panelHeight} />
        {hasTamper && <ImagePanel src={tamperHeatmap!} label="Tamper Overlay" badge="HEATMAP" height={panelHeight} />}
      </div>
    </div>
  );
}
