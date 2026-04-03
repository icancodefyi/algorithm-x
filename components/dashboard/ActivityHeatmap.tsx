const REGIONS = [
  { name: "North America", base: 0.78 },
  { name: "Europe", base: 0.71 },
  { name: "Asia Pacific", base: 0.84 },
  { name: "South America", base: 0.43 },
  { name: "Middle East", base: 0.53 },
  { name: "South Asia", base: 0.47 },
  { name: "Africa", base: 0.19 },
];

const HOURS = 24;

function seeded(r: number, h: number, base: number): number {
  const n = (Math.sin(r * 7.3 + h * 2.1) + Math.cos(r * 3.1 + h * 5.7)) * 0.17;
  return Math.max(0.04, Math.min(1, base + n));
}

function heatColor(v: number): string {
  if (v < 0.15) return "#f0ede8";
  if (v < 0.35) return "#fed7aa";
  if (v < 0.55) return "#fdba74";
  if (v < 0.72) return "#f97316";
  if (v < 0.88) return "#ef4444";
  return "#b91c1c";
}

const MATRIX = REGIONS.map((r, ri) =>
  Array.from({ length: HOURS }, (_, hi) => seeded(ri, hi, r.base))
);

const HOUR_LABELS = Array.from({ length: HOURS }, (_, i) =>
  i % 6 === 0 ? `${String(i).padStart(2, "0")}h` : ""
);

const LEGEND_COLORS = ["#f0ede8", "#fed7aa", "#fdba74", "#f97316", "#ef4444", "#b91c1c"];

export function ActivityHeatmap() {
  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">
            Deepfake Activity Heatmap
          </p>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">
            Report origin intensity by region · last 24 hours
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#c4bdb5]">UTC · 24H WINDOW</span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: "580px" }}>
          {/* Hour labels row */}
          <div className="flex mb-1">
            <div style={{ width: "112px" }} className="shrink-0" />
            {HOUR_LABELS.map((label, i) => (
              <div key={i} className="flex-1 text-center">
                {label && (
                  <span className="font-mono text-[8px] text-[#c4bdb5]">{label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Region rows */}
          {REGIONS.map((region, ri) => (
            <div key={region.name} className="flex items-center mb-1">
              <span
                className="text-[11px] text-[#6b7280] shrink-0 pr-3"
                style={{ width: "112px" }}
              >
                {region.name}
              </span>
              {MATRIX[ri].map((v, hi) => (
                <div key={hi} className="flex-1 px-px">
                  <div
                    className="rounded-[2px]"
                    style={{
                      height: "18px",
                      background: heatColor(v),
                    }}
                    title={`${region.name} ${String(hi).padStart(2, "0")}:00 — ${Math.round(v * 100)}%`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] font-mono text-[#c4bdb5]">Low</span>
        {LEGEND_COLORS.map((c) => (
          <div key={c} className="w-5 h-4 rounded-[2px] shrink-0" style={{ background: c }} />
        ))}
        <span className="text-[10px] font-mono text-[#c4bdb5]">High</span>
        <span className="ml-auto text-[10px] font-mono text-[#c4bdb5]">
          Simulated · based on platform report field
        </span>
      </div>
    </div>
  );
}
