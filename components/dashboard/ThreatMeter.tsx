function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

const CX = 120, CY = 130, R = 82;
const START = 225, SWEEP = 270;

function getColor(s: number) {
  if (s <= 40) return "#22c55e";
  if (s <= 65) return "#f59e0b";
  if (s <= 85) return "#f97316";
  return "#ef4444";
}

const TICKS = [0, 25, 50, 75, 100];

interface ThreatMeterProps {
  score?: number;
  aiDetections?: number;
  tamperSignals?: number;
  registryHits?: number;
}

export function ThreatMeter({
  score = 67,
  aiDetections = 142,
  tamperSignals = 89,
  registryHits = 23,
}: ThreatMeterProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const fillAngle = START + (safeScore / 100) * SWEEP;
  const fillColor = getColor(safeScore);
  const riskLabel =
    safeScore <= 40 ? "Low Risk" : safeScore <= 65 ? "Moderate" : safeScore <= 85 ? "Elevated Risk" : "Critical";

  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Deepfake Threat Index</p>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#9ca3af]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <svg width="240" height="185" viewBox="0 0 240 185">
          {/* Background track */}
          <path
            d={arcPath(CX, CY, R, START, START + SWEEP)}
            fill="none"
            stroke="#f0ede8"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={arcPath(CX, CY, R, START, fillAngle)}
            fill="none"
            stroke={fillColor}
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Colored zones (subtle) */}
          <path d={arcPath(CX, CY, R, START, START + SWEEP * 0.4)} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
          <path d={arcPath(CX, CY, R, START + SWEEP * 0.4, START + SWEEP * 0.65)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
          <path d={arcPath(CX, CY, R, START + SWEEP * 0.65, START + SWEEP * 0.85)} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
          <path d={arcPath(CX, CY, R, START + SWEEP * 0.85, START + SWEEP)} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
          {/* Tick marks */}
          {TICKS.map((t) => {
            const ta = START + (t / 100) * SWEEP;
            const o = polarToCartesian(CX, CY, R + 10, ta);
            const i = polarToCartesian(CX, CY, R + 4, ta);
            return (
              <line key={t} x1={o.x.toFixed(1)} y1={o.y.toFixed(1)} x2={i.x.toFixed(1)} y2={i.y.toFixed(1)} stroke="#d4cfc9" strokeWidth="1.5" />
            );
          })}
          {/* Tick labels */}
          {[0, 50, 100].map((t) => {
            const ta = START + (t / 100) * SWEEP;
            const p = polarToCartesian(CX, CY, R + 18, ta);
            return (
              <text key={t} x={p.x.toFixed(1)} y={(p.y + 4).toFixed(1)} textAnchor="middle" style={{ fontFamily: "ui-monospace,monospace", fontSize: "9px", fill: "#c4bdb5" }}>
                {t}
              </text>
            );
          })}
          {/* Needle tip dot */}
          {(() => {
            const tip = polarToCartesian(CX, CY, R, fillAngle);
            return <circle cx={tip.x.toFixed(1)} cy={tip.y.toFixed(1)} r="5.5" fill={fillColor} stroke="white" strokeWidth="2" />;
          })()}
          {/* Score number */}
          <text x={CX} y={CY - 8} textAnchor="middle" style={{ fontFamily: "ui-monospace,monospace", fontSize: "48px", fontWeight: "800", fill: "#0a0a0a" }}>
            {safeScore}
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" style={{ fontFamily: "ui-monospace,monospace", fontSize: "11px", fill: "#a8a29e", letterSpacing: "0.06em" }}>
            / 100
          </text>
        </svg>

        <div className="text-center -mt-1">
          <p className="text-[1.5rem] font-semibold tracking-tight" style={{ color: fillColor }}>
            {riskLabel}
          </p>
          <p className="text-[11.5px] text-[#9ca3af] mt-1 max-w-55 leading-snug">
            Composite signal across all forensic detection layers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 mt-5 pt-4 border-t border-[#f0ede8]">
        {[
          { label: "AI Detections", value: String(aiDetections) },
          { label: "Tamper Signals", value: String(tamperSignals) },
          { label: "Registry Hits", value: String(registryHits) },
        ].map((s, i) => (
          <div key={s.label} className={`text-center py-1 ${i < 2 ? "border-r border-[#f0ede8]" : ""}`}>
            <p className="text-[19px] font-semibold text-[#0a0a0a] font-mono tabular-nums">{s.value}</p>
            <p className="text-[9.5px] text-[#9ca3af] mt-0.5 uppercase tracking-wide leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
