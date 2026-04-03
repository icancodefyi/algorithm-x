const SERVICES = [
  { name: "C2PA Verifier", status: "active", latency: "12ms", version: "v2.1" },
  { name: "Artifact Detector", status: "active", latency: "38ms", version: "v3.4" },
  { name: "Hash Registry", status: "active", latency: "4ms", version: "v1.8" },
  { name: "Forensic Pipeline", status: "active", latency: "61ms", version: "v4.0" },
  { name: "ELA Engine", status: "active", latency: "29ms", version: "v2.6" },
  { name: "GAN Classifier", status: "active", latency: "44ms", version: "v5.1" },
  { name: "EXIF Parser", status: "active", latency: "8ms", version: "v1.3" },
  { name: "Noise Analyzer", status: "degraded", latency: "180ms", version: "v2.0" },
] as const;

type Status = "active" | "degraded" | "offline";

const STATUS_DOT: Record<Status, string> = {
  active: "#22c55e",
  degraded: "#f59e0b",
  offline: "#ef4444",
};

const STATUS_CHIP: Record<Status, string> = {
  active: "text-emerald-700 bg-emerald-50",
  degraded: "text-amber-700 bg-amber-50",
  offline: "text-red-700 bg-red-50",
};

export function EngineStatus() {
  const active = SERVICES.filter((s) => s.status === "active").length;

  return (
    <div className="rounded-xl border border-[#e8e4de] bg-white p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">
          Verification Engine Status
        </p>
        <span className="text-[10px] font-mono text-emerald-600">
          {active}/{SERVICES.length} ACTIVE
        </span>
      </div>

      <div className="flex-1 flex flex-col">
        {SERVICES.map((s, i) => (
          <div
            key={s.name}
            className={`flex items-center justify-between py-2.5 ${
              i < SERVICES.length - 1 ? "border-b border-[#f8f5f2]" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: STATUS_DOT[s.status as Status] }}
              />
              <span className="text-[12.5px] text-[#374151]">{s.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#c4bdb5]">{s.version}</span>
              <span className="font-mono text-[10.5px] text-[#9ca3af] tabular-nums w-12 text-right">
                {s.latency}
              </span>
              <span
                className={`text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded ${STATUS_CHIP[s.status as Status]}`}
              >
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#f0ede8] flex items-center justify-between">
        <p className="text-[10px] font-mono text-[#a8a29e]">Polled every 30s</p>
        <p className="text-[10px] font-mono text-emerald-600">Uptime 99.98%</p>
      </div>
    </div>
  );
}
