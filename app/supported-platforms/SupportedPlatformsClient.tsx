"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type PlatformCard = {
  domain: string;
  providerType: string;
  removalType: string;
  removalPageUrl: string;
  contactEmail: string;
  dataQuality: number;
  logoFile: string | null;
  supported: boolean;
};

function prettyProviderType(value: string): string {
  if (!value) return "Unknown infra";
  return value.replace(/_/g, " ");
}

function prettyRemovalType(value: string): string {
  if (!value) return "Route unavailable";
  return value.replace(/_/g, " ");
}

function PlatformGrid({ platforms }: { platforms: PlatformCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {platforms.map((platform) => (
        <article key={platform.domain} className="rounded-xl border border-[#e8e4de] bg-white px-4 py-4 hover:border-[#c4bdb5] transition-colors">
          <div className="w-12 h-12 rounded-xl border border-[#f0ede8] bg-[#fafaf8] flex items-center justify-center overflow-hidden mb-3">
            {platform.logoFile ? (
              <Image
                src={`/supported-platforms/${platform.logoFile}`}
                alt={`${platform.domain} logo`}
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <span className="font-mono text-[13px] text-[#9ca3af] uppercase">
                {platform.domain.slice(0, 2)}
              </span>
            )}
          </div>

          <p className="text-[12.5px] font-semibold text-[#0a0a0a] break-all mb-2">{platform.domain}</p>

          <div className="space-y-1.5">
            <p className="text-[11px] text-[#6b7280]">
              <span className="font-medium text-[#374151]">Route:</span> {prettyRemovalType(platform.removalType)}
            </p>
            <p className="text-[11px] text-[#6b7280]">
              <span className="font-medium text-[#374151]">Infra:</span> {prettyProviderType(platform.providerType)}
            </p>
            {platform.supported && platform.removalPageUrl ? (
              <a
                href={platform.removalPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[11px] text-rose-600 hover:underline"
              >
                Open route
              </a>
            ) : (
              <p className="text-[11px] text-[#9ca3af]">No takedown route yet</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function SupportedPlatformsClient({ platforms }: { platforms: PlatformCard[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return platforms;
    return platforms.filter((platform) => platform.domain.toLowerCase().includes(normalized));
  }, [platforms, query]);

  const supported = filtered.filter((platform) => platform.supported);
  const unsupported = filtered.filter((platform) => !platform.supported);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-4 py-3 inline-flex items-center gap-3 w-fit">
          <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest">Total Known Platforms</p>
          <span className="text-[20px] text-[#0a0a0a] font-semibold leading-none">{platforms.length}</span>
        </div>

        <div className="w-full sm:max-w-sm">
          <label htmlFor="platform-search" className="block text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-2">
            Search Platforms
          </label>
          <input
            id="platform-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by domain..."
            className="w-full rounded-xl border border-[#e8e4de] bg-white px-4 py-3 text-[12.5px] text-[#374151] placeholder:text-[#c4bdb5] focus:outline-none focus:border-[#0a0a0a] transition-colors"
          />
        </div>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-mono text-rose-500 uppercase tracking-widest mb-1">Route Available</p>
            <h2 className="text-[20px] font-semibold text-[#0a0a0a]">Supported for Takedown</h2>
          </div>
          <span className="text-[12px] text-[#9ca3af]">{supported.length} shown</span>
        </div>

        {supported.length > 0 ? (
          <PlatformGrid platforms={supported} />
        ) : (
          <div className="rounded-xl border border-[#e8e4de] bg-white px-5 py-6 text-[12.5px] text-[#6b7280]">
            No supported platforms match your search.
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-mono text-[#a8a29e] uppercase tracking-widest mb-1">Tracked Only</p>
            <h2 className="text-[20px] font-semibold text-[#0a0a0a]">Platforms Without Verified Route</h2>
          </div>
          <span className="text-[12px] text-[#9ca3af]">{unsupported.length} shown</span>
        </div>

        {unsupported.length > 0 ? (
          <PlatformGrid platforms={unsupported} />
        ) : (
          <div className="rounded-xl border border-[#e8e4de] bg-white px-5 py-6 text-[12.5px] text-[#6b7280]">
            No unsupported platforms match your search.
          </div>
        )}
      </section>
    </>
  );
}