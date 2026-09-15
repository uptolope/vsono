import type { MetadataRoute } from "next";

const SITE = "https://www.sonoprep.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account/",
        "/auth/",
        "/billing/",
        "/login",
        "/signup",
        "/reset-password",
        "/forgot-password",
        "/verify-email",
        "/flashcards/review/",
        "/study-notes/viewer/",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
