/**
 * Canonical public origin for SEO surfaces (canonicals, sitemap, robots,
 * structured data, Open Graph).
 *
 * Production serves on the www host — the apex domain redirects to it — so
 * every URL we publish to search engines must use www. A canonical that points
 * at a redirecting URL gives Google conflicting signals.
 */
export const SITE_URL = "https://www.sonoprep.com";

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Official profiles. Used by the footer and Organization `sameAs` schema. */
export const SOCIAL_PROFILES = [
  { label: "LinkedIn", href: "https://www.linkedin.com/groups/42841070/" },
  { label: "Instagram", href: "https://www.instagram.com/sonoprep/" },
] as const;

export const SUPPORT_EMAIL = "support@sonoprep.com";
