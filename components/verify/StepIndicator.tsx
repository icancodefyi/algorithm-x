import { STEP_LABELS } from "./constants";

interface Props {
  step: number;
}

export function StepIndicator({ step }: Props) {
  return (
    <div className="flex items-start gap-0 mb-12">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono border transition-all ${
                  done
                    ? "bg-[#0a0a0a] border-[#0a0a0a] text-white"
                    : active
                    ? "bg-white border-indigo-500 text-indigo-600 ring-2 ring-indigo-100"
                    : "bg-white border-[#e0dbd4] text-[#a8a29e]"
                }`}
              >
                {done ? (
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span className={`text-[10px] font-mono ${active ? "text-indigo-600" : "text-[#a8a29e]"}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-4 transition-colors ${
                  done ? "bg-[#0a0a0a]" : "bg-[#e0dbd4]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
