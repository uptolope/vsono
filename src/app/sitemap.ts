import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap generated at build time by Next.js.
 * Accessible at /sitemap.xml — no package needed.
 *
 * Add new blog posts or pages here. Priority:
 *  1.0 = homepage
 *  0.9 = products / demo (money pages)
 *  0.8 = blog index
 *  0.7 = individual blog posts
 *  0.5 = legal / about
 */

const SITE = "https://sonoprep.com";

const BLOG_POSTS = [
  { slug: "complete-spi-exam-guide", updated: "2026-06-15" },
  { slug: "ardms-exam-blueprint", updated: "2026-06-15" },
  { slug: "doppler-principles-spi-exam", updated: "2026-06-15" },
  { slug: "ultrasound-physics-spi", updated: "2026-06-15" },
  { slug: "ultrasound-artifacts-spi", updated: "2026-06-15" },
  { slug: "pass-spi-first-attempt", updated: "2026-06-15" },
  { slug: "spaced-repetition-spi-exam", updated: "2026-06-15" },
  { slug: "test-taking-strategies-spi", updated: "2026-06-15" },
  { slug: "ardms-specialties-comparison", updated: "2026-06-15" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/demo`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/terms`,
      lastModified: "2026-06-15",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: "2026-06-15",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: post.updated,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
