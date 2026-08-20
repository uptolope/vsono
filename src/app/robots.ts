import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/billing/"],
      },
      // OpenAI
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      // Anthropic
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      // Google (Gemini / AI Overviews training)
      { userAgent: "Google-Extended", allow: "/" },
      // Perplexity
      { userAgent: "PerplexityBot", allow: "/" },
      // Meta
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      // Apple
      { userAgent: "Applebot-Extended", allow: "/" },
      // Cohere
      { userAgent: "cohere-ai", allow: "/" },
      // Common Crawl (used by many AI trainers)
      { userAgent: "CCBot", allow: "/" },
      // ByteDance
      { userAgent: "Bytespider", allow: "/" },
    ],
    sitemap: "https://sonoprep.com/sitemap.xml",
  };
}
