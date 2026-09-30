import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-config";

/**
 * Single source of truth for robots.txt (the duplicate public/robots.txt was
 * removed so the two can't drift apart).
 *
 * Private, transactional and API surfaces are kept out of the crawl. AI/search
 * crawlers are NOT blocked: public pages and /llms.txt are intentionally
 * readable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
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
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
