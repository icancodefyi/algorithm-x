const SIGNALS = [
  { name: "ELA Anomalies", short: "ELA", value: 0.82 },
  { name: "JPEG Compression", short: "JPEG", value: 0.61 },
  { name: "Sensor Noise", short: "Noise", value: 0.74 },
  { name: "Spectral Artifacts", short: "Spectral", value: 0.55 },
  { name: "Keypoint Distortion", short: "Keypoints", value: 0.68 },
  { name: "Color Histogram", short: "Color", value: 0.43 },
];

const CX = 130, CY = 130, MAX_R = 88;

function pt(i: number, r: number) {
  const angle = ((i * 60 - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function polygon(values: number[]) {
  return values
    .map((v, i) => {
      const p = pt(i, v * MAX_R);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

const LEVELS = [0.25, 0.5, 0.75, 1.0];

export function SignalRadar() {
  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Signal Activity Radar</p>
        <span className="text-[10px] font-mono text-[#c4bdb5]">6 SIGNALS</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg width="260" height="260" viewBox="0 0 260 260">
          {/* Grid polygons */}
          {LEVELS.map((level) => (
            <polygon
              key={level}
              points={polygon(SIGNALS.map(() => level))}
              fill={level === 1 ? "none" : "none"}
              stroke="#f0ede8"
              strokeWidth={level === 1 ? "1.5" : "1"}
            />
          ))}

          {/* Axis lines */}
          {SIGNALS.map((_, i) => {
            const end = pt(i, MAX_R);
            return (
              <line key={i} x1={CX} y1={CY} x2={end.x.toFixed(1)} y2={end.y.toFixed(1)} stroke="#e8e4de" strokeWidth="1" />
            );
          })}

          {/* Data fill */}
          <polygon
            points={polygon(SIGNALS.map((s) => s.value))}
            fill="rgba(99,102,241,0.1)"
            stroke="#6366f1"
            strokeWidth="1.5"
          />

          {/* Data points */}
          {SIGNALS.map((s, i) => {
            const p = pt(i, s.value * MAX_R);
            return (
              <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#6366f1" stroke="white" strokeWidth="1.5" />
            );
          })}

          {/* Axis labels */}
          {SIGNALS.map((s, i) => {
            const p = pt(i, MAX_R + 20);
            const anchor = p.x < CX - 5 ? "end" : p.x > CX + 5 ? "start" : "middle";
            return (
              <text
                key={i}
                x={p.x.toFixed(1)}
                y={(p.y + 4).toFixed(1)}
                textAnchor={anchor}
                style={{ fontSize: "10px", fontFamily: "ui-monospace,monospace", fill: "#9ca3af", letterSpacing: "0.03em" }}
              >
                {s.short}
              </text>
            );
          })}

          {/* Level labels on top axis */}
          {LEVELS.map((level) => {
            const p = pt(0, level * MAX_R);
            return (
              <text
                key={level}
                x={(p.x + 4).toFixed(1)}
                y={(p.y - 3).toFixed(1)}
                style={{ fontSize: "8px", fontFamily: "ui-monospace,monospace", fill: "#d4cfc9" }}
              >
                {Math.round(level * 100)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Signal legend with values */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-3 border-t border-[#f0ede8]">
        {SIGNALS.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-[10.5px] text-[#6b7280] truncate">{s.name}</span>
            </div>
            <span className="font-mono text-[10.5px] font-semibold text-[#0a0a0a] tabular-nums shrink-0">
              {Math.round(s.value * 100)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
