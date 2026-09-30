# Growth implementation record — 2026-09-29

Follows the operating rules in `docs/SEO-AUDIT-2026-09-29.md`: no fabricated
data, reviews or statistics; no manipulative link tactics; human approval
before publishing, outreach or production changes. Every item lists evidence,
expected impact, effort, risk and required approval.

Nothing here was validated against a real database, Stripe, a live email
provider or GA4 — only `tsc`, `eslint`, `npm run check:invariants` and a
`next build` + `next start` smoke test. See "Verify after deploy".

## A1. Analytics and lead tracking
| | |
|---|---|
| Evidence | `src/lib/analytics.ts` only `console.log`ged; no GA/UET script was ever loaded, so no event fired. Lead capture was labelled `sign_up`. `signup/page.tsx` sent the user's email and phone to Microsoft UET and the email to GA, contradicting the privacy policy and GA terms. |
| Change | GA4 loader (`components/Analytics.tsx`) only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set and never for DNT/GPC. Events: `generate_lead`, tool use, CTA click, `sign_up`, `begin_checkout`. Server-side `purchase` via Measurement Protocol from the Stripe webhook (needs `GA_API_SECRET`). PII removed from analytics; invariant 7 guards it. No Microsoft UET. |
| Impact | Makes lead → purchase attribution measurable for the first time. |
| Effort / Risk | M / Low. Script is off until configured. |
| Approval | Owner creates the GA4 property, sets the env vars, marks `generate_lead` and `purchase` as key events. |

## A2. Lead follow-up emails
| | |
|---|---|
| Evidence | `/api/demo/capture` never stored the lead; its rate-limit key was the literal string `\${ip}`, so all visitors shared one 5/hour bucket; the welcome email showed invented per-domain scores to everyone; forms promised a "domain breakdown" that never existed. |
| Change | `captureLead()` persists `Subscriber`/`DemoLead`; welcome email only for new subscribers; 3-email sequence (+2d plan, +5d options, +7d last) via `/api/cron/nurture` (daily, `vercel.json`); one-click unsubscribe (RFC 8058 header + `/unsubscribe` confirm page, signed tokens); never re-enrols an unsubscribed address; skips purchasers; honest copy (free diagnostic link + study tips). Migration `20260929190000` marks existing subscribers as already through the sequence. |
| Impact | Converts otherwise-lost demo leads; expected effect unknown until measured. |
| Effort / Risk | L / Medium (email compliance). Ships **dark**: needs `LEAD_NURTURE_ENABLED=true`, `MAIL_POSTAL_ADDRESS`, `CRON_SECRET`, verified sender domain. |
| Approval | Owner reviews email copy and legal basis. Single opt-in (fine for US/CAN-SPAM); EU/UK visitors would need consent/double opt-in. |

## A3. Server-render the money pages / site chrome
| | |
|---|---|
| Evidence | Verified with `next start`: `/`, `/products`, `/demo` are server-rendered. But (a) only the homepage rendered `<Header/>`/`<Footer/>` — every other page had **no navigation and no footer** (no Terms/Privacy links, no crawl paths); (b) `LazySection` used an IntersectionObserver, so 9 homepage sections (FAQ, pricing, "who is this for"…) were absent from server HTML; (c) duplicate `id="main-content"`. |
| Change | `SiteChrome` (header + footer on every page, bare on `/embed/*`); `LazySection` now always renders and uses CSS `content-visibility: auto`; removed duplicate ids; blog posts no longer call `headers()` for a nonce that nothing sets (they were forced dynamic; now static). Invariant 11 guards both. |
| Impact | High for crawlability, internal linking, trust and AI/Bing crawlers that do not run JS. |
| Effort / Risk | M / Low-Medium (layout change on all pages — eyeball the header spacing on a preview). |

## A4. Linkable assets
Formula sheet expanded (11 → 28 formulas, each checked against standard physics
definitions); shared `ResourceFooter` (last updated, methodology, real
references, correction email, optional reviewer from env, APA + link snippet,
print) on formula sheet, glossary, calculators and Nyquist tool;
`/embed/nyquist-calculator` (noindex, canonical to the tool, credit link, framable).
Removed the invented author name "SonoPrep Clinical Faculty" from schema.
Approval: owner decides whether to name a real reviewer (`NEXT_PUBLIC_REVIEWER_*`).

## A5. Product landing pages
`/spi-flashcards`, `/spi-exam-simulator`, `/spi-physics-pearls`, `/spi-study-notes`:
server-rendered, real prices/terms from `src/lib/catalog.ts` (invariant 9 checks they
match `/products`), demo content only for samples, Product + Offer schema, no ratings.

## A6. High-intent content (both written from official ARDMS/Inteleos pages, checked 2026-09-29)
- `/blog/spi-study-plan-30-45-days` — hour split is arithmetic on published weights (23/7/26/34/10).
- `/blog/ardms-spi-exam-cost-scheduling-retakes` — $275 fee, ~110 questions / 2 h, 300–700 scale with 555 to pass, reapply after 3 days but 60-day wait, 5-year rule, published pass rates 2013–2023 (copied exactly).
Author is "SonoPrep Editorial Team". Approval: owner reads/approves before promotion.

## A7. Structured data
Organization (+`sameAs` from footer profiles, `contactPoint`), WebSite, BreadcrumbList,
BlogPosting (with `dateModified`), Product+Offer. Removed site-wide `Course`. No review markup (invariant 10).

## A8. Internal linking / housekeeping
Footer resource links; header "Free Tools"; blog footer tool links; products → detail pages; sitemap now lists the Nyquist tool, four product pages, two posts; `.backup` files, `schema-backup.prisma`, `encoding_errors.csv` deleted; `llms.txt` and markdown mirrors updated.

## Claims corrected (found while writing the landing pages)
| Claim | Reality | Fix |
|---|---|---|
| FAQ: "110 questions with a **2.5-hour** limit; ~90 scored / 20 unscored" | ARDMS: ~110 questions over **two hours** incl. a 5-minute survey; scored/unscored split not published | Rewritten to the published facts |
| "questions are weighted to match the real exam", "mapped … at real exam ratios", "weighted by domain frequency" | Attempts are a uniform random draw of 110 from 155 (`shuffleQuestions`). Bank by its own domain tags: 55/14/40/42/4 (Doppler 27% vs 34% official; Safety ≈2.6% vs 10%). Tags also use the pre-V24.1 domain names. | Claims removed. **Product gap, not just copy** — see todo. |
| "200+ flashcards" | Exactly 200 | "200" |
| "10 organized chapters" vs "15 chapters" | 15 sections in data | Standardised |
| "Most students start here / get the bundle / upgrade after 1–2 exams", "Most Students Choose This" | No sales data exists | Removed; replaced with verifiable "Best Value — save $17.99" |
| FAQ: "cohort dashboards and LMS integration" for programs | No such feature in the codebase | Reduced to "volume pricing enquiries" |
| FAQ "Most candidates need 4–8 weeks" | No data | "Many candidates plan for roughly 4–8 weeks" |
| `llms.txt`: "retake … $250+" | Official fee $275 | Updated with source |

Not changed, owner must confirm they are true: "written/reviewed by credentialed / RDMS sonographers who passed the SPI and scan daily" (FAQ, blog index, `llms.txt`); "independently written questions" (the data-file header says the bank was sourced from an external PDF — confirm licensing/originality); "159 pages".

## Verify after deploy
1. Env vars (see `.env.example`): GA ID + API secret; nurture flags, `MAIL_POSTAL_ADDRESS`, `CRON_SECRET`, `EMAIL_FROM`, `EMAIL_REPLY_TO`; optional reviewer/social vars.
2. Run `prisma migrate deploy` on staging first (migrations `…175000`, `…180000`, `…190000`).
3. Stripe test-mode purchase → webhook → access window (45 days for bundle) → GA `purchase`.
4. Submit a demo lead; confirm `Subscriber`/`DemoLead` rows and the welcome email; click unsubscribe.
5. Visually check header spacing on inner pages and the embed in an iframe.
6. Search Console: submit sitemap, inspect the four product pages and the two posts.
