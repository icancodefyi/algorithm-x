"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { LangCode } from "@/components/i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { lang, setLang, languages } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === lang) ?? languages[0];

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (code: LangCode) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
        style={{
          border: "1px solid #e0d8d0",
          color: "#3d3530",
          background: "#fff",
          letterSpacing: "0.01em",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-[#b0a89e]"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{current.native}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg z-200 overflow-hidden"
          style={{ borderColor: "#e0d8d0" }}
          role="listbox"
        >
          <div
            className="px-3 pt-2.5 pb-1.5 font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "#a8a29e" }}
          >
            Select Language
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={lang === l.code}
              onClick={() => select(l.code as LangCode)}
              className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors hover:bg-[#faf9f7]"
            >
              <span className="text-[13.5px]" style={{ color: "#0a0a0a" }}>
                {l.native}
              </span>
              <span
                className="text-[11px]"
                style={{ color: "#b0a89e" }}
              >
                {l.name}
              </span>
              {lang === l.code && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  className="ml-1 shrink-0"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
