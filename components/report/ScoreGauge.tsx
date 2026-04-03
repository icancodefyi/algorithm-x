interface Props {
  score: number;
}

export function ScoreGauge({ score }: Props) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const isLikelyManipulated = score >= 85;
  const isHighSuspicion = score >= 70 && score < 85;
  const isMediumRisk = score >= 50 && score < 70;
  const isLowSuspicion = score >= 30 && score < 50;

  const color = isLikelyManipulated
    ? "#dc2626"
    : isHighSuspicion
    ? "#ea580c"
    : isMediumRisk
    ? "#d97706"
    : isLowSuspicion
    ? "#ca8a04"
    : "#16a34a";

  const bg = isLikelyManipulated
    ? "bg-red-50 border-red-100"
    : isHighSuspicion
    ? "bg-orange-50 border-orange-100"
    : isMediumRisk
    ? "bg-amber-50 border-amber-100"
    : isLowSuspicion
    ? "bg-yellow-50 border-yellow-100"
    : "bg-green-50 border-green-100";

  const label = isLikelyManipulated
    ? "LIKELY MANIPULATED"
    : isHighSuspicion
    ? "HIGH SUSPICION"
    : isMediumRisk
    ? "MEDIUM RISK"
    : isLowSuspicion
    ? "LOW SUSPICION"
    : "LIKELY AUTHENTIC";

  const labelColor = isLikelyManipulated
    ? "text-red-700"
    : isHighSuspicion
    ? "text-orange-700"
    : isMediumRisk
    ? "text-amber-700"
    : isLowSuspicion
    ? "text-yellow-700"
    : "text-green-700";

  return (
    <div className={`flex flex-col items-center sm:items-start gap-4 p-5 rounded-xl border ${bg}`}>
      <div className="shrink-0 self-center">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
          <text
            x="60"
            y="56"
            textAnchor="middle"
            fontSize="28"
            fontWeight="700"
            fill="#0a0a0a"
            fontFamily="Georgia,'Times New Roman',serif"
          >
            {score}
          </text>
          <text x="60" y="72" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">
            /100
          </text>
        </svg>
      </div>
      <div className="w-full min-w-0">
        <p className="text-[10.5px] font-mono text-[#a8a29e] uppercase tracking-widest mb-1 text-center sm:text-left">Final Authenticity Risk</p>
        <p className={`text-[15px] font-bold tracking-wider font-mono text-center sm:text-left ${labelColor}`}>{label}</p>
        <p className="text-[12.5px] text-[#6b7280] mt-2 leading-relaxed text-center sm:text-left">
          {isLikelyManipulated
            ? "Neural and forensic fusion indicates likely manipulation."
            : isHighSuspicion
            ? "Strong manipulation indicators detected; manual review advised."
            : isMediumRisk
            ? "Mixed indicators detected; additional review recommended."
            : isLowSuspicion
            ? "Only weak indicators detected in this image."
            : "No significant manipulation indicators detected."}
        </p>
      </div>
    </div>
  );
}
