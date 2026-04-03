import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Typography } from "@/components/ui/typography";
import { Navbar } from "@/components/landing/Navbar";
import { CoverImage } from "@/components/blog/CoverImage";
import Image from "next/image";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Sniffer`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ background: "#fafaf8" }}>
      <Navbar />

      <article className="pt-28 pb-24">
        {/* Centred content column */}
        <div className="mx-auto px-8" style={{ maxWidth: "800px" }}>
          {/* Back link */}
          <div className="mb-10">
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-widest transition-colors hover:text-[#0a0a0a]"
              style={{ color: "#b0a89e" }}
            >
              <span>←</span>
              <span>Resources</span>
            </Link>
          </div>

          {/* Article header */}
          <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: "#f3f0eb",
                  color: "#7a7268",
                  border: "1px solid #e8e4de",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className="text-[2.3rem] font-semibold leading-tight tracking-tight mb-5"
            style={{ color: "#0a0a0a" }}
          >
            {post.title}
          </h1>

          <p
            className="text-[16px] leading-relaxed mb-8"
            style={{ color: "#7a7268" }}
          >
            {post.description}
          </p>

          {/* Author + date row */}
          <div
            className="flex items-center gap-4 pb-8"
            style={{ borderBottom: "1px solid #e8e4de" }}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#f0ede8]">
              <Image src="/author.png" alt={post.author} width={36} height={36} className="object-contain w-full h-full" />
            </div>
            <div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: "#0a0a0a" }}
              >
                {post.author}
              </p>
              <p
                className="text-[12px] font-mono"
                style={{ color: "#b0a89e" }}
              >
                {formattedDate}
              </p>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.image && (
          <div className="mb-10">
            <CoverImage src={post.image} alt={post.title} />
          </div>
        )}

        {/* MDX content */}
        <div>
          <Typography>
            <MDXRemote source={post.content} />
          </Typography>
        </div>

        {/* Footer CTA */}
        <div className="mt-16">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#0a0a0a",
              border: "1px solid #1e1e1e",
            }}
          >
            <p
              className="text-[11px] font-mono uppercase tracking-widest mb-3"
              style={{ color: "#7a7268" }}
            >
              Sniffer Platform
            </p>
            <h3
              className="text-[1.3rem] font-semibold mb-3"
              style={{ color: "#f5f2ee" }}
            >
              Verify an image with one upload
            </h3>
            <p
              className="text-[13.5px] leading-relaxed mb-6"
              style={{ color: "#9a9088" }}
            >
              Run a full forensic analysis — C2PA provenance, AI detection, ELA,
              DCT analysis, and more — in under 30 seconds.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-medium text-[#0a0a0a] transition-opacity hover:opacity-80"
              style={{ background: "#f5f2ee" }}
            >
              Start Investigation
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Back to Resources */}
        <div
          className="mt-12 pt-8 border-t"
          style={{ borderColor: "#e8e4de" }}
        >
          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-widest transition-colors hover:text-[#0a0a0a]"
            style={{ color: "#b0a89e" }}
          >
            <span>←</span>
            <span>All Resources</span>
          </Link>
        </div>

        </div>{/* end centred column */}
      </article>
    </div>
  );
}
