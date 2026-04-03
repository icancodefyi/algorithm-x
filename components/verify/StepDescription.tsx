interface Props {
  value: string;
  onChange: (v: string) => void;
  anonymous: boolean | null;
  platform: string;
  issueType: string;
}

export function StepDescription({ value, onChange, anonymous, platform, issueType }: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] text-indigo-500 uppercase tracking-widest mb-3">Step 3 of 3</p>
      <h1
        className="text-3xl text-[#0a0a0a] leading-snug mb-2"
        style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
      >
        Describe what happened
      </h1>
      <p className="text-[14px] text-[#6b7280] mb-8">
        Optional — but your account helps build a stronger evidence report. Keep it factual.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. A manipulated photo of me appeared on Instagram targeting my professional reputation..."
        maxLength={500}
        rows={5}
        className="w-full border border-[#e8e4de] rounded-xl px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#c4bdb5] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
      />
      <p className="text-[11px] text-[#a8a29e] text-right mt-1">{value.length}/500</p>

      <div className="mt-5 border border-[#e8e4de] rounded-xl divide-y divide-[#f0ede8]">
        {[
          { label: "Report type", value: anonymous ? "Anonymous" : "With details" },
          { label: "Platform", value: platform },
          { label: "Issue type", value: issueType },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center px-4 py-3">
            <span className="text-[12px] text-[#9ca3af]">{row.label}</span>
            <span className="text-[12px] font-medium text-[#0a0a0a]">{row.value}</span>
          </div>
        ))}
      </div>

      <p className="text-[11.5px] text-[#a8a29e] mt-3 leading-relaxed">
        By submitting this case you agree that the information provided is truthful to the best of your knowledge.
        This data is used solely for forensic analysis.
      </p>
    </div>
  );
}
