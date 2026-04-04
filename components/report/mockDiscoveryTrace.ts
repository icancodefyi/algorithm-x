import type { DiscoveryResult } from "@/components/report/types";

/**
 * Demo distribution trace — same targets for leak (NCII) and forensic flows when
 * live discover has no matches yet, so ContentTrace and LeakActionConsole stay aligned.
 */
export function buildMockDiscoveryResult(caseId: string): DiscoveryResult {
  const now = Date.now() / 1000;
  return {
    case_id: caseId,
    status: "completed",
    started_at: now - 42,
    finished_at: now,
    prioritized_network: "NCII Mirror Network",
    target_domains: [
      "xhamster.com",
      "erome.com",
      "leakedviral.com",
      "viralkand.com",
      "mydesi.ltd",
      "desiporn.xxx",
    ],
    current_domain: null,
    current_page: null,
    current_asset: null,
    domains_scanned: 6,
    pages_scanned: 47,
    candidates_evaluated: 312,
    direct_matches: [
      {
        domain: "leakedviral.com",
        network: "NCII Mirror Network",
        provider_type: "leak-site",
        page_url: "https://leakedviral.com/gallery/a3f9d1",
        image_url: "https://leakedviral.com/img/a3f9d1.jpg",
        asset_type: "image/jpeg",
        confidence: 97,
        match_type: "exact",
        phash_distance: 2,
        dhash_distance: 1,
        ahash_distance: 3,
        ssim_score: 0.98,
      },
      {
        domain: "erome.com",
        network: "Adult Content CDN",
        provider_type: "content-platform",
        page_url: "https://erome.com/a/Xk29mL",
        image_url: "https://erome.com/media/Xk29mL/thumb.jpg",
        asset_type: "image/jpeg",
        confidence: 91,
        match_type: "near_duplicate",
        phash_distance: 6,
        dhash_distance: 5,
        ahash_distance: 7,
        ssim_score: 0.93,
      },
      {
        domain: "viralkand.com",
        network: "Viral Distribution Network",
        provider_type: "aggregator",
        page_url: "https://viralkand.com/posts/img-b81c",
        image_url: "https://viralkand.com/cdn/img-b81c.jpg",
        asset_type: "image/jpeg",
        confidence: 84,
        match_type: "probable",
        phash_distance: 11,
        dhash_distance: 9,
        ahash_distance: 10,
        ssim_score: 0.86,
      },
    ],
    related_domains: [
      {
        domain: "xhamster.com",
        network: "Adult Content CDN",
        provider_type: "content-platform",
        reason: "Visual fingerprint cluster match — content appears in related upload batch",
      },
      {
        domain: "mydesi.ltd",
        network: "NCII Mirror Network",
        provider_type: "mirror-site",
        reason: "Same CDN routing as leakedviral.com — high probability of mirrored content",
      },
      {
        domain: "desiporn.xxx",
        network: "NCII Mirror Network",
        provider_type: "mirror-site",
        reason: "Shared image hash cluster detected across 3 affiliated domains",
      },
    ],
    recent_events: [],
    error: null,
  };
}
