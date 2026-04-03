import { getAllPosts } from "@/lib/blog";
import { Navbar } from "@/components/landing/Navbar";
import { ArticleCard } from "@/components/blog/ArticleCard";

export const metadata = {
  title: "Resources — Sniffer",
  description:
    "Insights on digital media authenticity, C2PA provenance, AI detection, and forensic analysis from the Sniffer team.",
};

export default function ResourcesPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen" style={{ background: "#fafaf8" }}>
      <Navbar />

      <div className="px-4 sm:px-8" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Masthead */}
        <div className="pt-32 pb-0">
          <div
            className="flex flex-wrap items-end justify-between pb-6 gap-4"
            style={{ borderBottom: "2px solid #0a0a0a" }}
          >
            <div>
              <p
                className="text-[10px] font-mono uppercase tracking-[0.2em] mb-2"
                style={{ color: "#b0a89e" }}
              >
                Forensic Analysis · Provenance · Media Integrity
              </p>
              <h1
                className="text-[3rem] font-semibold tracking-tight leading-none"
                style={{ color: "#0a0a0a" }}
              >
                Sniffer Research
              </h1>
            </div>
            <div className="text-right pb-1 shrink-0">
              <p
                className="text-[11px] font-mono uppercase tracking-widest"
                style={{ color: "#b0a89e" }}
              >
                {posts.length} {posts.length === 1 ? "Article" : "Articles"}
              </p>
              <p
                className="text-[11px] font-mono mt-0.5"
                style={{ color: "#c8c0b8" }}
              >
                Vol. 1 — 2026
              </p>
            </div>
          </div>
        </div>

        {/* Article list */}
        <div className="pb-24">
          {posts.length === 0 ? (
            <div
              className="py-24 text-center"
              style={{ borderBottom: "1px solid #e8e4de" }}
            >
              <p
                className="text-[12px] font-mono uppercase tracking-widest"
                style={{ color: "#b0a89e" }}
              >
                No articles yet
              </p>
            </div>
          ) : (
            posts.map((post, index) => (
              <ArticleCard
                key={post.slug}
                post={post}
                index={index}
                featured={index === 0}
              />
            ))
          )}

          {/* End rule */}
          {posts.length > 0 && (
            <div style={{ borderTop: "1px solid #e8e4de" }} />
          )}
        </div>
      </div>

      <footer
        className="px-4 sm:px-8 py-8 border-t"
        style={{
          borderColor: "#e8e4de",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <p className="text-[12px] font-mono" style={{ color: "#b0a89e" }}>
          © 2026 Sniffer · Digital Media Authenticity
        </p>
      </footer>
    </div>
  );
}
