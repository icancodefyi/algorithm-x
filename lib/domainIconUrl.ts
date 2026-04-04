/**
 * Domain favicon via Google s2 (no API key). Used for report consoles and platform chips.
 */
export function domainIconUrl(domain: string, size = 64): string {
  const d = domain.trim().toLowerCase().replace(/^www\./, "");
  if (!d) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=${size}`;
}
