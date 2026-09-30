import type { MetadataRoute } from "next";
import { SITE_URL as SITE } from "@/lib/site-config";

const BLOG_POSTS = [
  { slug: "spi-study-plan-30-45-days", updated: "2026-09-29" },
  { slug: "ardms-spi-exam-cost-scheduling-retakes", updated: "2026-09-29" },
  { slug: "complete-spi-exam-guide", updated: "2026-06-15" },
  { slug: "ardms-exam-blueprint", updated: "2026-06-15" },
  { slug: "doppler-principles-spi-exam", updated: "2026-06-15" },
  { slug: "ultrasound-physics-spi", updated: "2026-06-15" },
  { slug: "spi-ultrasound-artifacts-guide", updated: "2026-06-15" },
  { slug: "pass-spi-first-attempt", updated: "2026-06-15" },
  { slug: "spaced-repetition-spi-exam", updated: "2026-06-15" },
  { slug: "test-taking-strategies-spi", updated: "2026-06-15" },
  { slug: "ardms-specialties-comparison", updated: "2026-06-15" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  // Members-only app routes (/exam-simulator, /physics-pearls, /study-notes) are
  // deliberately NOT listed: they are noindex and show only a sign-in/purchase
  // prompt to anonymous visitors.
  // lastModified is intentionally omitted for static pages: only real content
  // changes should be advertised (blog posts keep their recorded dates).
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/spi-flashcards`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE}/spi-exam-simulator`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE}/spi-physics-pearls`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/spi-study-notes`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/get-started`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/demo`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/free-spi-practice-test`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/ultrasound-physics-calculators`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/tools/nyquist-calculator`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/spi-physics-formula-sheet`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/spi-ultrasound-glossary`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/terms`, lastModified: "2026-06-15", changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/privacy`, lastModified: "2026-06-15", changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: post.updated,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
