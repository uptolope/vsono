#!/usr/bin/env node
// Cheap regression guards for things that have broken before.
// Run: npm run check:invariants   (exit 1 on failure)
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const fail = (msg) => failures.push(msg);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 1. Access windows: bundle must be 45 days, individual products 30.
const dur = readFileSync("src/lib/access-durations.ts", "utf8");
const expected = {
  FLASHCARDS: 30,
  EXAM_SIMULATOR: 30,
  PHYSICS_PEARLS: 30,
  STUDY_NOTES: 30,
  PREMIUM_BUNDLE: 45,
};
for (const [k, v] of Object.entries(expected)) {
  const m = dur.match(new RegExp(`${k}:\\s*(\\d+)`));
  if (!m || Number(m[1]) !== v) fail(`ACCESS_DAYS.${k} must be ${v}`);
}

// 2. Webhook must take the duration from code, not the DB column.
const hook = readFileSync("src/app/api/webhooks/stripe/route.ts", "utf8");
if (!hook.includes("getAccessDays(")) fail("webhook must use getAccessDays()");
if (/productRecord\.accessDurationDays\s*\*/.test(hook))
  fail("webhook must not compute expiry from Product.accessDurationDays");

// 3. One canonical host (www). No apex URLs in published surfaces.
const files = [...walk("src"), ...walk("public")].filter(
  (f) => /\.(tsx?|md|txt)$/.test(f) && !f.endsWith(".backup"),
);
for (const f of files) {
  if (/https:\/\/sonoprep\.com/.test(readFileSync(f, "utf8")))
    fail(`apex URL (use https://www.sonoprep.com) in ${f}`);
}

// 4. robots.txt has exactly one source.
if (existsSync("public/robots.txt"))
  fail("public/robots.txt conflicts with src/app/robots.ts");

// 5. No hard-coded ' | SonoPrep' in metadata titles (root template adds it).
for (const f of files.filter((f) => f.endsWith(".tsx"))) {
  if (/^  title:\s*\n?\s*["'][^"'\n]* \| SonoPrep["'],?$/m.test(readFileSync(f, "utf8")))
    fail(`title already gets the "| SonoPrep" template suffix: ${f}`);
}

// 6. Members-only app routes: noindex and never in the sitemap.
const sitemapSrc = readFileSync("src/app/sitemap.ts", "utf8");
for (const route of ["exam-simulator", "physics-pearls", "study-notes"]) {
  if (sitemapSrc.includes(`/${route}\``)) fail(`/${route} must not be in the sitemap`);
  const layout = readFileSync(`src/app/${route}/layout.tsx`, "utf8");
  if (!/index:\s*false/.test(layout)) fail(`/${route} layout must be noindex`);
}

const code = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const noStrings = (src) => code(src).replace(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g, '""');

// 7. No personal data (email/phone) may be passed to analytics calls.
for (const f of files.filter((f) => /\.tsx?$/.test(f))) {
  const src = noStrings(readFileSync(f, "utf8"));
  if (/\b(gtag|uetq\.push|trackSignup|trackLead|trackToolUse|trackCtaClick)\s*\([^)]*\b(email|phone)\b/i.test(src))
    fail(`analytics call appears to include email/phone in ${f}`);
}

// 8. Follow-up emails must carry an unsubscribe link and the one-click header.
const leadEmails = readFileSync("src/lib/lead-emails.ts", "utf8");
const leads = readFileSync("src/lib/leads.ts", "utf8");
if (!/unsubscribe/i.test(leadEmails)) fail("lead emails must include an unsubscribe link");
if (!/List-Unsubscribe-Post/.test(leadEmails + leads))
  fail("lead emails must send List-Unsubscribe / List-Unsubscribe-Post headers");

// 9. Product landing pages: prices must match /products, and be in the sitemap.
const catalog = readFileSync("src/lib/catalog.ts", "utf8");
const productsPage = readFileSync("src/app/products/page.tsx", "utf8");
for (const m of catalog.matchAll(/priceLabel:\s*"([^"]+)"/g)) {
  if (!productsPage.includes(`"${m[1]}"`))
    fail(`catalog price ${m[1]} not found on /products`);
}
for (const m of catalog.matchAll(/slug:\s*"([^"]+)"/g)) {
  if (!sitemapSrc.includes(`/${m[1]}\``)) fail(`/${m[1]} missing from sitemap`);
}

// 10. No review/rating structured data without verified first-party reviews.
for (const f of files.filter((f) => /\.tsx?$/.test(f))) {
  if (/aggregateRating|"@type":\s*"Review"/.test(code(readFileSync(f, "utf8"))))
    fail(`review/rating markup found in ${f} (no verified reviews exist)`);
}

// 11. Site chrome on every page; homepage sections must be in server HTML.
if (!readFileSync("src/app/layout.tsx", "utf8").includes("SiteChrome"))
  fail("layout.tsx must render SiteChrome (header/footer on every page)");
if (/IntersectionObserver/.test(code(readFileSync("src/app/page-client.tsx", "utf8"))))
  fail("homepage sections must not be gated behind IntersectionObserver (hidden from SSR)");

if (failures.length) {
  console.error("Invariant check FAILED:\n - " + failures.join("\n - "));
  process.exit(1);
}
console.log("All invariants OK.");
