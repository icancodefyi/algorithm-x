import { ISSUE_TYPES } from "./constants";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function StepIssueType({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] text-indigo-500 uppercase tracking-widest mb-3">Step 2 of 3</p>
      <h1
        className="text-3xl text-[#0a0a0a] leading-snug mb-2"
        style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
      >
        What type of issue is this?
      </h1>
      <p className="text-[14px] text-[#6b7280] mb-8">
        Categorizes the forensic analysis and indexes the case correctly.
      </p>
      <div className="flex flex-col gap-2.5">
        {ISSUE_TYPES.map((it) => (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            className={`text-left p-4 border rounded-xl transition-all flex items-center justify-between gap-4 ${
              value === it.value
                ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-100"
                : "border-[#e8e4de] bg-white hover:border-[#0a0a0a]"
            }`}
          >
            <div>
              <span className="block text-[14px] font-semibold text-[#0a0a0a]">{it.value}</span>
              <span className="block text-[12px] text-[#9ca3af] mt-0.5">{it.desc}</span>
            </div>
            {value === it.value && (
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                <svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
