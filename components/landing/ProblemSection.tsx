const PROBLEMS = [
  {
    n: "01",
    title: "They made it in seconds.",
    desc: "A fake image of you can be generated in under a minute with no technical skill. By the time you find it, it's already been shared, screenshot, and reuploaded across dozens of platforms.",
    stat: "New deepfakes take < 60 seconds to create",
  },
  {
    n: "02",
    title: "Platforms won't act without proof.",
    desc: "Every major platform requires a structured forensic report before they'll investigate. A screenshot and your word are not enough. Without verified evidence, your removal request gets closed.",
    stat: "Unverified reports are rejected >89% of the time",
  },
  {
    n: "03",
    title: "Most victims never get it removed.",
    desc: "You would need to know each platform's specific reporting format, the right contact for abuse teams, and how to establish forensic chain-of-custody — all while dealing with the trauma of it existing at all.",
    stat: "We've mapped 138 platform removal contacts for you",
  },
];

export function ProblemSection() {
  return (
    <section className="w-full bg-white py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        {/* Header */}
        <div className="mb-20 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8a29e]">
              The Reality
            </p>
            <h2
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-[#0a0a0a]"
              style={{ maxWidth: "520px" }}
            >
              They made it in seconds.<br />You've been fighting it for months.
            </h2>
          </div>
          {/* Pull-quote stat */}
          <div className="border-l-2 border-red-300 pl-5" style={{ maxWidth: "240px" }}>
            <p className="font-mono text-[32px] font-bold leading-none text-[#0a0a0a]">500M+</p>
            <p className="mt-2 text-[13px] leading-snug text-[#6b7280]">
              non-consensual deepfake images in circulation in 2024 — the vast majority never removed
            </p>
          </div>
        </div>

        {/* Three columns — divided by 1px rules, no cards */}
        <div className="grid grid-cols-1 border-t border-[#e8e4de] md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <div
              key={p.n}
              className={[
                "flex flex-col gap-5 py-10",
                i < 2 ? "border-b border-[#e8e4de] md:border-b-0 md:border-r md:pr-12" : "",
                i > 0 ? "md:pl-12" : "",
              ].join(" ")}
            >
              <span className="font-mono text-[12px] font-medium text-[#c4bdb5]">{p.n}</span>
              <div>
                <h3 className="mb-3 text-[20px] font-semibold leading-snug text-[#0a0a0a]">{p.title}</h3>
                <p className="text-[15px] leading-[1.7] text-[#6b7280]">{p.desc}</p>
              </div>
              <div className="mt-auto border-t border-[#f0ece6] pt-5">
                <p className="font-mono text-[11.5px] text-[#a8a29e]">{p.stat}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
