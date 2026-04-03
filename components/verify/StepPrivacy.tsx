interface Props {
  value: boolean | null;
  onChange: (v: boolean) => void;
}

export function StepPrivacy({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] text-indigo-500 uppercase tracking-widest mb-3">Step 1 of 4</p>
      <h1
        className="text-3xl text-[#0a0a0a] leading-snug mb-2"
        style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
      >
        Do you want to report anonymously?
      </h1>
      <p className="text-[14px] text-[#6b7280] mb-8">
        Anonymous reports are fully accepted. No personal information required or stored.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: true, label: "Yes, anonymously", desc: "No personal data stored" },
          { value: false, label: "No, with my details", desc: "Enables case follow-up" },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left p-5 border rounded-xl transition-all ${
              value === opt.value
                ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-100"
                : "border-[#e8e4de] bg-white hover:border-[#0a0a0a]"
            }`}
          >
            <p className="text-[14px] font-semibold text-[#0a0a0a] mb-1">{opt.label}</p>
            <p className="text-[12px] text-[#9ca3af]">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
