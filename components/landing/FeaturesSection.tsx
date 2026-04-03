const FEATURES = [
  {
    tag: "Detection",
    title: "Error-Level Analysis",
    desc: "Reveals compression inconsistencies that indicate regions were edited or composited into the image after original encoding.",
  },
  {
    tag: "Detection",
    title: "GAN Artifact Detection",
    desc: "Identifies spectral and spatial patterns unique to AI-generated faces — invisible to the human eye but statistically consistent across GAN outputs.",
  },
  {
    tag: "Metadata",
    title: "EXIF Forensics",
    desc: "Cross-checks camera model, software IDs, GPS tags, and creation timestamps. Missing or inconsistent metadata is a primary manipulation signal.",
  },
  {
    tag: "Structural",
    title: "Clone Region Mapping",
    desc: "Detects copy-move forgeries: regions duplicated within the same frame to hide or add content — common in document and scene manipulation.",
  },
  {
    tag: "Biometric",
    title: "Facial Landmark Distortion",
    desc: "Measures deviation in 68 facial landmarks against expected proportions. Warp-based deepfakes leave measurable asymmetries in bone-level geometry.",
  },
  {
    tag: "Signal",
    title: "Noise Pattern Analysis",
    desc: "Every camera sensor leaves a unique noise fingerprint. Composited regions break this pattern — detected even after JPEG recompression.",
  },
  {
    tag: "Provenance",
    title: "Compression Fingerprinting",
    desc: "Analyzes DCT block quantization tables to detect double-compression artifacts — a telltale sign of re-saving after editing or AI generation.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-white py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8a29e]">
          Analysis Capabilities
        </p>
        <div className="mb-20 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-[#0a0a0a]"
            style={{ maxWidth: "480px" }}
          >
            Seven independent layers.<br />One verdict.
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#6b7280]" style={{ maxWidth: "300px" }}>
            Each layer is independent. A manipulated image rarely fools all seven —
            the combination is what makes the verdict reliable.
          </p>
        </div>

        {/* Grid — no cards, just top-ruled rows */}
        <div className="grid grid-cols-1 gap-0 border-t border-[#e8e4de] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={[
                "flex flex-col gap-4 py-10",
                // right border on col 1 and 2 (not 3)
                (i % 3 !== 2) ? "lg:border-r lg:border-[#e8e4de] lg:pr-10" : "",
                // left padding on col 2 and 3
                (i % 3 !== 0) ? "lg:pl-10" : "",
                // bottom border on all rows except the last
                (i < 6) ? "border-b border-[#e8e4de]" : "",
                // sm: right border on even cols
                (i % 2 === 0) ? "sm:border-r sm:border-[#e8e4de] sm:pr-8 lg:pr-0" : "sm:pl-8 lg:pl-0",
              ].join(" ")}
            >
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
                {f.tag}
              </span>
              <div>
                <h3 className="mb-2.5 text-[18px] font-semibold leading-snug text-[#0a0a0a]">{f.title}</h3>
                <p className="text-[14.5px] leading-[1.7] text-[#6b7280]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
