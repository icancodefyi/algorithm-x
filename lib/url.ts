/**
 * Extracts the bare hostname from any URL string or naked domain.
 * Strips the www. prefix for consistent downstream lookups.
 *
 * Examples:
 *   "https://www.xvideos.com/video/123" → "xvideos.com"
 *   "desileak49.com/video/abc"          → "desileak49.com"
 *   "www.pornhub.com"                   → "pornhub.com"
 */
export function extractDomain(raw: string): string {
  const input = raw.trim();
  // Add scheme if missing so the URL constructor can parse it
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  try {
    const { hostname } = new URL(withScheme);
    return hostname.replace(/^www\./i, "");
  } catch {
    // Fallback for malformed input: strip scheme + path manually
    return withScheme
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .replace(/^www\./i, "");
  }
}
