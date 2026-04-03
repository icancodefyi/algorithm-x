interface Props {
  elaHeatmap?: string | null;
  tamperRegions?: Array<{ id: number; area_pct: number; type: string }>;
}

export function TamperHeatmap({ elaHeatmap, tamperRegions }: Props) {
  if (!elaHeatmap) return null;

  const regionCount = tamperRegions?.length ?? 0;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest">
          Error Level Analysis
        </p>
        {regionCount > 0 && (
          <span className="bg-red-100 text-red-700 text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-200">
            {regionCount} tampered region{regionCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ELA Heatmap */}
      <div className="rounded-xl border border-[#e8e4de] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={elaHeatmap} alt="ELA Heatmap" className="w-full object-contain max-h-64" />
        <div className="px-4 py-2.5 bg-[#fafaf8] border-t border-[#e8e4de] flex items-center justify-between">
          <p className="text-[10.5px] text-[#6b7280] font-mono">
            Brighter regions indicate higher error levels — potential sites of tampering.
          </p>
          {/* Colormap legend */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-16 h-2.5 rounded-sm" style={{ background: "linear-gradient(to right, #00008b, #00bfff, #00ff00, #ffff00, #ff4500)" }} />
            <span className="text-[9px] font-mono text-[#9ca3af]">low → high</span>
          </div>
        </div>
      </div>

      {/* Tamper regions summary */}
      {tamperRegions && tamperRegions.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tamperRegions.slice(0, 6).map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-[#e8e4de] bg-white px-3 py-2 flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-[9px] font-bold text-red-700">
                {r.id}
              </span>
              <div>
                <p className="text-[11px] font-mono text-[#374151]">{r.area_pct.toFixed(1)}% area</p>
                <p className="text-[9.5px] text-[#a8a29e] capitalize">{r.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
