import type { NextConfig } from "next";

const securityHeaders = [
  {
    // Prevent the site from being embedded in iframes (clickjacking defense).
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Tell browsers to stick to HTTPS for this domain.
    // includeSubDomains covers e.g. api.sonoprep.com.
    // 1 year = 31536000 seconds; preload lets you submit to browser preload lists.
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    // Prevent browsers from MIME-sniffing a response away from the
    // declared Content-Type — blocks drive-by attacks via crafted files.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Controls how much referrer information is sent with requests.
    // strict-origin-when-cross-origin: send full URL for same-origin,
    // origin only for cross-origin, nothing for http→https downgrade.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Disable browser features we don't use. Expand as needed.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Content-Security-Policy is intentionally NOT set here anymore.
  // It moved to src/middleware.ts because a per-request nonce is
  // needed to drop 'unsafe-inline' from script-src — next.config.ts's
  // headers() function is static and can't generate a fresh nonce per
  // request. See src/middleware.ts for the actual CSP definition.
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
