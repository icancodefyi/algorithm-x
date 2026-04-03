import { PLATFORMS } from "./constants";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function StepPlatform({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] text-indigo-500 uppercase tracking-widest mb-3">Step 1 of 3</p>
      <h1
        className="text-3xl text-[#0a0a0a] leading-snug mb-2"
        style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
      >
        Where did you find the manipulated content?
      </h1>
      <p className="text-[14px] text-[#6b7280] mb-8">
        This becomes part of the evidence report and determines takedown guidance.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {PLATFORMS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={`py-4 px-3 border rounded-xl text-[13px] font-medium transition-all ${
              value === p.value
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                : "border-[#e8e4de] bg-white text-[#374151] hover:border-[#0a0a0a]"
            }`}
          >
            {p.value}
          </button>
        ))}
      </div>
    </div>
  );
}
