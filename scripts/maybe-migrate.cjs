// ═══════════════════════════════════════════════════════════════════
// Runs `prisma migrate deploy` automatically as part of the Vercel
// build, so a forgotten manual migration step can no longer be the
// reason payments/signups/logins fail at runtime.
//
// Previously: `build` was just `next build`. The build would succeed
// with zero errors even if the database had no tables at all — every
// DB-touching route (checkout, the Stripe webhook, login, signup)
// would only fail the first time a real request hit it, in
// production, with a paying customer on the other end.
//
// This runs as "vercel-build" (Vercel auto-detects and prefers this
// script name over "build" — no project-settings change needed).
//
// Guard: only runs if DATABASE_URL is actually set. This means a
// Preview deploy with no DATABASE_URL configured still builds fine
// (skips migration, same as before) instead of hard-failing the
// build. If DATABASE_URL IS set — including on Preview — migrations
// run. `prisma migrate deploy` only applies pending migrations, so
// running it repeatedly is safe and a no-op once the DB is current.
//
// One thing this does NOT solve: if your Preview and Production
// environments in Vercel point at the SAME DATABASE_URL, every
// preview deploy will run migrations against your real production
// database. Confirm in Vercel's env var settings whether Preview has
// its own DATABASE_URL (recommended) or shares Production's.
// ═══════════════════════════════════════════════════════════════════

const { execSync } = require("node:child_process");

if (!process.env.DATABASE_URL) {
  console.log("[maybe-migrate] DATABASE_URL not set — skipping prisma migrate deploy.");
  process.exit(0);
}

console.log("[maybe-migrate] DATABASE_URL is set — running prisma migrate deploy...");

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("[maybe-migrate] Migrations applied successfully.");
} catch (err) {
  console.error("[maybe-migrate] prisma migrate deploy FAILED — stopping the build.");
  console.error(
    "[maybe-migrate] A failed build here is intentional: it's safer to stop " +
    "the deploy than to ship a site whose database schema doesn't match its code."
  );
  process.exit(1);
}
