import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { SupportedPlatformsClient } from "./SupportedPlatformsClient";

type PlatformRow = {
  domain: string;
  providerType: string;
  removalType: string;
  removalPageUrl: string;
  contactEmail: string;
  dataQuality: number;
};

type PlatformCard = PlatformRow & {
  logoFile: string | null;
  supported: boolean;
};

function parseCsvLine(line: string): string[] {
  return line.split(",").map((part) => part.trim());
}

async function loadSupportedPlatforms(): Promise<PlatformCard[]> {
  const datasetPath = path.join(process.cwd(), "services", "takedown", "data", "dataset.csv");
  const logosDir = path.resolve(process.cwd(), "public", "supported-platforms");

  const [csvRaw, logoNames] = await Promise.all([
    fs.readFile(datasetPath, "utf8"),
    fs.readdir(logosDir),
  ]);

  const logoDomains = logoNames
    .filter((name) => name.toLowerCase().endsWith(".webp"))
    .map((name) => ({
      domain: name.slice(0, -5).toLowerCase(),
      logoFile: name,
    }));

  const lines = csvRaw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const rows = lines.slice(1);

  const uniqueByDomain = new Map<string, PlatformRow>();

  for (const row of rows) {
    const cols = parseCsvLine(row);
    if (cols.length < 8) continue;

    const domain = cols[0].toLowerCase();
    const providerType = cols[2];
    const removalPageUrl = cols[3];
    const removalType = cols[4];
    const contactEmail = cols[5];
    const dataQuality = Number.parseInt(cols[7], 10) || 0;

    const hasRoute = Boolean(removalPageUrl) || Boolean(contactEmail);
    if (!domain || !hasRoute) continue;

    const existing = uniqueByDomain.get(domain);
    if (!existing) {
      uniqueByDomain.set(domain, {
        domain,
        providerType,
        removalType,
        removalPageUrl,
        contactEmail,
        dataQuality,
      });
      continue;
    }

    if ((dataQuality > existing.dataQuality) || (!existing.removalPageUrl && removalPageUrl)) {
      uniqueByDomain.set(domain, {
        domain,
        providerType,
        removalType,
        removalPageUrl,
        contactEmail,
        dataQuality,
      });
    }
  }

  return logoDomains
    .map(({ domain, logoFile }) => {
      const matched = uniqueByDomain.get(domain);
      return {
        domain,
        providerType: matched?.providerType ?? "",
        removalType: matched?.removalType ?? "",
        removalPageUrl: matched?.removalPageUrl ?? "",
        contactEmail: matched?.contactEmail ?? "",
        dataQuality: matched?.dataQuality ?? 0,
        logoFile,
        supported: Boolean(matched),
      };
    })
    .sort((a, b) => {
      if (a.supported !== b.supported) {
        return a.supported ? -1 : 1;
      }
      return a.domain.localeCompare(b.domain);
    });
}

export default async function SupportedPlatformsPage() {
  const platforms = await loadSupportedPlatforms();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#f0ede8] px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
        <Link
          href="/"
          className="font-mono text-[13px] text-[#0a0a0a] tracking-widest uppercase hover:opacity-70 transition-opacity"
        >
          Sniffer
        </Link>
        <span className="text-[#d4cfc9]">/</span>
        <span className="text-[13px] text-[#9ca3af]">Supported Platforms</span>
        <Link
          href="/start"
          className="ml-auto text-[12px] font-medium bg-[#0a0a0a] text-white px-4 py-1.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
        >
          Start Investigation
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="mb-10">
          <p className="font-mono text-[11px] text-rose-500 uppercase tracking-widest mb-3">
            Takedown Coverage
          </p>
          <h1
            className="text-4xl text-[#0a0a0a] leading-snug mb-3"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            Supported Platforms
          </h1>
          <p className="text-[14px] text-[#6b7280] max-w-3xl leading-relaxed">
            Platforms where Sniffer currently has takedown routing metadata. Coverage is sourced from the takedown dataset and updated continuously.
          </p>
        </div>

        <SupportedPlatformsClient platforms={platforms} />
      </main>
    </div>
  );
}
