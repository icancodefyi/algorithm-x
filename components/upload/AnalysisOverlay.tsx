interface Props {
  step: number;
  steps: string[];
}

export function AnalysisOverlay({ step, steps }: Props) {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/96 z-50 flex items-center justify-center">
      <div className="max-w-sm w-full px-8">
        <p className="font-mono text-[10.5px] text-[#4b5563] uppercase tracking-widest mb-10 text-center">
          Sniffer · Forensic Analysis Engine
        </p>

        <div className="space-y-5 mb-10">
          {steps.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    done
                      ? "bg-indigo-600"
                      : active
                      ? "border-2 border-indigo-500"
                      : "border border-[#374151]"
                  }`}
                >
                  {done && (
                    <svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {active && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                </div>
                <span
                  className={`text-[13px] transition-colors duration-300 ${
                    done ? "text-[#4b5563]" : active ? "text-white" : "text-[#2d3748]"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-[#1f2937] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-[10.5px] text-[#4b5563] mt-3 text-center font-mono">
          {Math.round(((step + 1) / steps.length) * 100)}% complete
        </p>
      </div>
    </div>
  );
}
