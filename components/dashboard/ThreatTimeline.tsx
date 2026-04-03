"use client";

import { useEffect, useRef, useState } from "react";

type Severity = "high" | "medium" | "low";

interface TimelineEvent {
  id: number;
  time: string;
  event: string;
  severity: Severity;
}

const SEED: { event: string; severity: Severity }[] = [
  { event: "Spectral artifacts detected in uploaded image", severity: "high" },
  { event: "ELA anomaly regions flagged — 4 zones identified", severity: "high" },
  { event: "Registry hash match — duplicate content detected", severity: "medium" },
  { event: "C2PA manifest missing from submitted file", severity: "medium" },
  { event: "EXIF timestamp inconsistency detected", severity: "medium" },
  { event: "GAN artifact fingerprint pattern identified", severity: "high" },
  { event: "Double JPEG compression confirmed", severity: "medium" },
  { event: "Facial landmark asymmetry — 3.4° deviation", severity: "high" },
  { event: "PRNU noise mismatch in upper-left quadrant", severity: "high" },
  { event: "Clone region match detected — copy-move forgery", severity: "medium" },
  { event: "AI-generated metadata tag found in EXIF", severity: "high" },
  { event: "Color histogram divergence flagged", severity: "low" },
  { event: "Forensic pipeline completed — verdict: Manipulated", severity: "high" },
  { event: "Anonymous case submission received", severity: "low" },
  { event: "Platform report filed — Instagram", severity: "low" },
  { event: "C2PA provenance chain verified — origin confirmed", severity: "medium" },
  { event: "Keypoint distortion map generated", severity: "medium" },
  { event: "Noise pattern analysis complete — 91% confidence", severity: "high" },
];

const SEV_COLOR: Record<Severity, string> = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#9ca3af",
};

function timeLabel(d: Date) {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ThreatTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const counterRef = useRef(0);

  // Populate on mount to avoid hydration mismatch
  useEffect(() => {
    const base = Date.now();
    const initial: TimelineEvent[] = SEED.slice(0, 14).map((s, i) => ({
      id: i,
      time: timeLabel(new Date(base - i * 22000 - Math.abs(Math.sin(i)) * 9000)),
      ...s,
    }));
    setEvents(initial);
    counterRef.current = SEED.length;

    const interval = setInterval(() => {
      const idx = counterRef.current % SEED.length;
      const newEv: TimelineEvent = {
        id: counterRef.current,
        time: timeLabel(new Date()),
        ...SEED[idx],
      };
      setEvents((prev) => [newEv, ...prev.slice(0, 19)]);
      counterRef.current += 1;
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Threat Timeline</p>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#9ca3af]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE FEED
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto flex flex-col min-h-0"
        style={{ maxHeight: "360px" }}
      >
        {events.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] font-mono text-[#c4bdb5]">Connecting to feed…</p>
          </div>
        ) : (
          events.map((e, i) => (
            <div
              key={e.id}
              className="flex items-start gap-3 px-2 py-2.5 border-b border-[#f8f5f2] last:border-0"
              style={{ opacity: Math.max(0.3, 1 - i * 0.045) }}
            >
              <span className="font-mono text-[10px] text-[#b0a89e] shrink-0 mt-0.5 tabular-nums w-16">
                {e.time}
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ background: SEV_COLOR[e.severity] }}
              />
              <span className="text-[11.5px] text-[#374151] leading-snug">{e.event}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#f0ede8] flex items-center gap-4">
        {(["high", "medium", "low"] as Severity[]).map((sev) => (
          <div key={sev} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SEV_COLOR[sev] }} />
            <span className="text-[10px] font-mono text-[#9ca3af] capitalize">{sev}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
