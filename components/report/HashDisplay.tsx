interface Props {
  hash: string;
  onCopy: () => void;
  copied: boolean;
}

export function HashDisplay({ hash, onCopy, copied }: Props) {
  return (
    <div className="bg-[#0a0a0a] px-5 py-3.5 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-mono text-[#4b5563] uppercase tracking-[0.15em] mb-1.5">SHA-256 File Hash</p>
        <p className="font-mono text-[10.5px] text-[#e5e7eb] break-all leading-relaxed">{hash}</p>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 mt-0.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium border border-[#374151] text-[#9ca3af] hover:text-white hover:border-[#6b7280] transition-colors"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
