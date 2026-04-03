const SIGNALS = [
  { name: "FFT Grid Artifacts", count: 234, pct: 91, tag: "AI" },
  { name: "PRNU Mismatch", count: 198, pct: 77, tag: "Sensor" },
  { name: "Double JPEG Compression", count: 175, pct: 68, tag: "Encoding" },
  { name: "EXIF Inconsistencies", count: 162, pct: 63, tag: "Metadata" },
  { name: "Chromatic Aberration Absence", count: 144, pct: 56, tag: "Optics" },
  { name: "ELA Anomaly Regions", count: 131, pct: 51, tag: "ELA" },
  { name: "Facial Landmark Distortion", count: 98, pct: 38, tag: "Bio" },
  { name: "Clone Region Match", count: 67, pct: 26, tag: "Copy-Move" },
];

function barColor(pct: number) {
  if (pct > 75) return "#ef4444";
  if (pct > 50) return "#f97316";
  return "#fbbf24";
}

export function ContentSignals() {
  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Detection Signals Triggered</p>
        <span className="text-[10px] font-mono text-[#c4bdb5]">ALL TIME · 412 CASES</span>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {SIGNALS.map((s, i) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-[#c4bdb5] w-4 shrink-0 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11.5px] text-[#374151] truncate">{s.name}</span>
                  <span
                    className="shrink-0 px-1.5 py-0.5 rounded text-[8.5px] font-mono uppercase tracking-wide"
                    style={{ background: "#f5f3f0", color: "#9ca3af" }}
                  >
                    {s.tag}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#6b7280] tabular-nums shrink-0 ml-3">{s.count}</span>
              </div>
              <div className="h-2 rounded-full bg-[#f5f3f0] overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${s.pct}%`, background: barColor(s.pct) }}
                />
              </div>
            </div>
            <span
              className="font-mono text-[10.5px] font-semibold tabular-nums w-8 text-right shrink-0"
              style={{ color: barColor(s.pct) }}
            >
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
