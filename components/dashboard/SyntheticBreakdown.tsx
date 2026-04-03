const SEGMENTS = [
  { label: "AI Generated", pct: 34, color: "#ef4444" },
  { label: "Edited Images", pct: 26, color: "#f97316" },
  { label: "Authentic Media", pct: 40, color: "#22c55e" },
];

// Build conic-gradient string
const gradient = (() => {
  let cum = 0;
  return SEGMENTS.map((s) => {
    const from = cum;
    cum += s.pct;
    return `${s.color} ${from}% ${cum}%`;
  }).join(", ");
})();

export function SyntheticBreakdown() {
  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Synthetic Media Breakdown</p>
      </div>

      <div className="flex-1 flex items-center gap-6">
        {/* Donut via conic-gradient */}
        <div
          className="relative shrink-0 rounded-full"
          style={{
            width: "120px",
            height: "120px",
            background: `conic-gradient(${gradient})`,
          }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-white"
            style={{ margin: "22px" }}
          >
            <span className="font-mono text-[16px] font-bold text-[#0a0a0a]">40%</span>
            <span className="font-mono text-[7.5px] text-[#a8a29e] uppercase tracking-wide">Authentic</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-3.5">
          {SEGMENTS.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="text-[12px] text-[#374151]">{s.label}</span>
                </div>
                <span className="font-mono text-[13px] font-bold text-[#0a0a0a] tabular-nums">{s.pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-[#f5f3f0] overflow-hidden">
                <div className="h-1 rounded-full" style={{ width: `${s.pct}%`, background: s.color, opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#f0ede8]">
        <p className="text-[10px] font-mono text-[#a8a29e]">
          Classified via FFT · PRNU · C2PA manifest scoring
        </p>
      </div>
    </div>
  );
}
