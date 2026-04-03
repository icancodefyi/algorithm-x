"use client";

interface CoverImageProps {
  src: string;
  alt: string;
}

export function CoverImage({ src, alt }: CoverImageProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#e8e4de] aspect-video bg-[#f3f0eb]">
      {/* eslint-disable-next-line @next/next-eslint-plugin/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).parentElement!.style.display = "none";
        }}
      />
    </div>
  );
}
