"use client";

import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/lib/blog";

interface ArticleCardProps {
  post: BlogPostMeta;
  index: number;
  featured?: boolean;
}

export function ArticleCard({ post, index, featured }: ArticleCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const num = String(index + 1).padStart(2, "0");

  if (featured) {
    return (
      <Link
        href={`/resources/${post.slug}`}
        className="group block py-12"
        style={{ borderBottom: "1px solid #e8e4de" }}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start">
          {/* Big number - hidden on mobile */}
          <div className="hidden sm:block shrink-0 pt-1">
            <span
              className="font-mono font-light leading-none select-none"
              style={{ fontSize: "5.5rem", color: "#e8e4de", lineHeight: 1 }}
            >
              {num}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
                {post.tags.map((tag, i) => (
                  <span key={tag} className="flex items-center gap-3">
                    {i > 0 && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "#d8d0c8" }}
                      >
                        ·
                      </span>
                    )}
                    <span
                      className="text-[10px] font-mono uppercase tracking-widest"
                      style={{ color: "#b0a89e" }}
                    >
                      {tag}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2
              className="font-semibold leading-tight mb-4 transition-colors group-hover:text-black"
              style={{ fontSize: "1.9rem", color: "#0a0a0a", letterSpacing: "-0.01em" }}
            >
              {post.title}
            </h2>

            {/* Description */}
            <p
              className="text-[15px] leading-relaxed mb-6 max-w-2xl"
              style={{ color: "#7a7268" }}
            >
              {post.description}
            </p>

            {/* Footer row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-[#f0ede8]">
                  <Image src="/author.png" alt={post.author} width={24} height={24} className="object-contain w-full h-full" />
                </div>
                <span
                  className="text-[12.5px] font-medium"
                  style={{ color: "#3d3530" }}
                >
                  {post.author}
                </span>
                <span
                  className="text-[11px] font-mono"
                  style={{ color: "#c8c0b8" }}
                >
                  · {formattedDate}
                </span>
              </div>

              <span
                className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-widest transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: "#0a0a0a" }}
              >
                Read Article →
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Secondary row style
  return (
    <Link
      href={`/resources/${post.slug}`}
            className="group flex gap-4 sm:gap-8 items-start py-8 transition-colors"
      style={{ borderBottom: "1px solid #e8e4de" }}
    >
      {/* Index number */}
      <div className="shrink-0 pt-0.5 w-10">
        <span
          className="text-[2rem] font-mono font-light leading-none select-none"
          style={{ color: "#ddd8d0" }}
        >
          {num}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            {post.tags.map((tag, i) => (
              <span key={tag} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "#d8d0c8" }}
                  >
                    ·
                  </span>
                )}
                <span
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: "#b0a89e" }}
                >
                  {tag}
                </span>
              </span>
            ))}
          </div>
        )}

        <h2
          className="text-[1.2rem] font-semibold leading-snug mb-2 transition-colors group-hover:text-black"
          style={{ color: "#0a0a0a" }}
        >
          {post.title}
        </h2>

        <p
          className="text-[13px] leading-relaxed line-clamp-2 mb-3"
          style={{ color: "#7a7268" }}
        >
          {post.description}
        </p>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-[#f0ede8]">
            <Image src="/author.png" alt={post.author} width={20} height={20} className="object-contain w-full h-full" />
          </div>
          <span
            className="text-[11.5px] font-medium"
            style={{ color: "#5a4e47" }}
          >
            {post.author}
          </span>
        </div>
      </div>

      {/* Date + arrow - hidden on mobile */}
      <div className="hidden sm:flex shrink-0 flex-col items-end justify-between gap-6 pt-0.5">
        <span
          className="text-[11px] font-mono uppercase tracking-wider whitespace-nowrap"
          style={{ color: "#b0a89e" }}
        >
          {formattedDate}
        </span>
        <span
          className="text-[1rem] transition-transform duration-200 group-hover:translate-x-1"
          style={{ color: "#0a0a0a" }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
