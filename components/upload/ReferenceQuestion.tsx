interface Props {
  onUpload: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function ReferenceQuestion({ onUpload, onSkip, onBack }: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] text-indigo-500 uppercase tracking-widest mb-3">Reference Image</p>
      <h1
        className="text-3xl text-[#0a0a0a] leading-snug mb-2"
        style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
      >
        Do you have the original image?
      </h1>
      <p className="text-sm text-[#6b7280] mb-8">
        Providing the original enables deeper forensic comparison — pixel diff, structural similarity,
        and hash validation across both images.
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onUpload}
          className="text-left p-5 border-2 border-[#0a0a0a] rounded-xl bg-white hover:bg-[#fafaf8] transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <svg width="17" height="17" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#0a0a0a]">Upload Original Image</p>
              <p className="text-[12px] text-[#6b7280] mt-1">
                Reference-based forensic comparison — pixel-level diff and structural similarity analysis
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="text-left p-5 border border-[#e8e4de] rounded-xl bg-white hover:border-[#a8a29e] transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f5f3ef] flex items-center justify-center shrink-0">
              <svg width="17" height="17" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#374151]">Continue Without Reference</p>
              <p className="text-[12px] text-[#9ca3af] mt-1">
                Single-image analysis — metadata, pattern detection, and classifier-based scoring
              </p>
            </div>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-8 text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
