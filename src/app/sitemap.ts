import type { MetadataRoute } from "next";

const SITE = "https://www.sonoprep.com";

const BLOG_POSTS = [
  { slug: "complete-spi-exam-guide", updated: "2026-06-15" },
  { slug: "doppler-principles-spi-exam", updated: "2026-06-15" },
  { slug: "ultrasound-physics-spi", updated: "2026-06-15" },
  { slug: "ultrasound-artifacts-spi", updated: "2026-06-15" },
  { slug: "pass-spi-first-attempt", updated: "2026-06-15" },
  { slug: "spaced-repetition-spi-exam", updated: "2026-06-15" },
  { slug: "test-taking-strategies-spi", updated: "2026-06-15" },
  { slug: "ardms-specialties-comparison", updated: "2026-06-15" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().split("T")[0];

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/get-started`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/free-spi-practice-test`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/ultrasound-physics-calculators`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/spi-physics-formula-sheet`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/spi-ultrasound-glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/exam-simulator`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/physics-pearls`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/study-notes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
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