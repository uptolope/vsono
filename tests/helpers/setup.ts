import { vi } from "vitest";
import { TEST_DB_NAME, urlFor } from "./db";

// Must be set before anything imports @/lib/prisma. Overwrites any real
// DATABASE_URL in the environment so app code under test can only ever reach
// the local test database.
process.env.DATABASE_URL = urlFor(TEST_DB_NAME);
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.NEXTAUTH_SECRET = "test-only-secret";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// No test may talk to a real third party.
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.RESEND_API_KEY;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.CRON_SECRET;
delete process.env.MAIL_POSTAL_ADDRESS;
delete process.env.LEAD_NURTURE_ENABLED;
delete process.env.EMAIL_FROM;
delete process.env.EMAIL_REPLY_TO;

// Sign-in is simulated: tests choose the session user with signInAs().
const session = vi.hoisted(() => ({ userId: null as string | null }));

vi.mock("next-auth", () => ({
  getServerSession: async () =>
    session.userId ? { user: { id: session.userId } } : null,
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

(globalThis as { __testSession?: typeof session }).__testSession = session;
