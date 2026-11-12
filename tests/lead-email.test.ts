import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET as cron } from "@/app/api/cron/nurture/route";
import { leadEmailConfig } from "@/lib/lead-emails";
import { captureLead } from "@/lib/leads";
import { resetDatabase } from "./helpers/fixtures";

// The email provider is replaced by a recorder: nothing is ever sent.
const sent = vi.hoisted(() => [] as { to: string; subject: string; headers?: Record<string, string> }[]);

vi.mock("@/lib/resend", () => ({
  getResendClient: () => {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    return {
      emails: {
        send: async (message: (typeof sent)[number]) => {
          sent.push(message);
          return { data: { id: "test" }, error: null };
        },
      },
    };
  },
}));

const ENV_KEYS = [
  "CRON_SECRET",
  "RESEND_API_KEY",
  "MAIL_POSTAL_ADDRESS",
  "LEAD_NURTURE_ENABLED",
  "EMAIL_FROM",
  "EMAIL_REPLY_TO",
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const TEST_ADDRESS = "Test Sender, 1 Test Street, Testville, TX 00000";

function runCron(authorization?: string) {
  return cron(
    new NextRequest("http://localhost/api/cron/nurture", {
      headers: authorization ? { authorization } : {},
    }),
  );
}

function fullyConfigured() {
  process.env.CRON_SECRET = "test-cron-secret";
  process.env.RESEND_API_KEY = "re_test";
  process.env.MAIL_POSTAL_ADDRESS = TEST_ADDRESS;
  process.env.LEAD_NURTURE_ENABLED = "true";
}

beforeEach(async () => {
  await resetDatabase();
  sent.length = 0;
  for (const key of ENV_KEYS) delete process.env[key];
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  vi.restoreAllMocks();
});

describe("lead email configuration", () => {
  it("with production's current settings, reports exactly what is missing", () => {
    // Production today: RESEND_API_KEY set; postal address, nurture flag,
    // EMAIL_FROM and EMAIL_REPLY_TO not set.
    process.env.RESEND_API_KEY = "re_test";

    const config = leadEmailConfig();

    expect(config).toMatchObject({
      resendApiKey: true,
      postalAddress: false,
      nurtureEnabled: false,
      canSendConfirmation: false,
      canSendFollowUps: false,
    });
    expect(config.problems).toHaveLength(2);
    expect(config.problems.join(" ")).toContain("MAIL_POSTAL_ADDRESS");
    expect(config.problems.join(" ")).toContain("LEAD_NURTURE_ENABLED");
  });

  it("reports no problems when everything is set", () => {
    fullyConfigured();

    expect(leadEmailConfig()).toMatchObject({
      canSendConfirmation: true,
      canSendFollowUps: true,
      problems: [],
    });
  });

  it("never exposes the values themselves", () => {
    fullyConfigured();

    const dump = JSON.stringify(leadEmailConfig());

    expect(dump).not.toContain("re_test");
    expect(dump).not.toContain("Testville");
    expect(dump).not.toContain("test-cron-secret");
  });
});

describe("capturing a lead", () => {
  it("without a postal address: stores the lead, sends nothing, and says so in the logs", async () => {
    process.env.RESEND_API_KEY = "re_test";

    await captureLead({ email: "Lead@Example.test", source: "demo_page" });

    const row = await prisma.subscriber.findUniqueOrThrow({ where: { email: "lead@example.test" } });
    expect(row.confirmationSentAt).toBeNull();
    expect(row.confirmedAt).toBeNull();
    expect(sent).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("MAIL_POSTAL_ADDRESS"));
    // The address itself is never logged.
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain("lead@example.test");
  });

  it("with a postal address: sends one confirmation request and nothing else", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.MAIL_POSTAL_ADDRESS = TEST_ADDRESS;

    await captureLead({ email: "lead@example.test", source: "demo_page" });
    await captureLead({ email: "lead@example.test", source: "demo_page" }); // resubmits the form

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("lead@example.test");

    const row = await prisma.subscriber.findUniqueOrThrow({ where: { email: "lead@example.test" } });
    expect(row.confirmationSentAt).toBeInstanceOf(Date);
    expect(row.confirmedAt).toBeNull();
    expect(row.nextNurtureAt).toBeNull();
  });
});

describe("GET /api/cron/nurture", () => {
  it("answers 503 while CRON_SECRET is not configured (production's current state)", async () => {
    const res = await runCron("Bearer anything");

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "CRON_SECRET not configured" });
  });

  it("rejects a missing or wrong secret", async () => {
    process.env.CRON_SECRET = "test-cron-secret";

    expect((await runCron()).status).toBe(401);
    expect((await runCron("Bearer wrong-secret-value")).status).toBe(401);
    expect((await runCron("test-cron-secret")).status).toBe(401);
  });

  it("with the secret but nothing else configured: runs, sends nothing, and lists what is missing", async () => {
    process.env.CRON_SECRET = "test-cron-secret";
    process.env.RESEND_API_KEY = "re_test";

    await prisma.subscriber.create({
      data: {
        email: "due@example.test",
        confirmedAt: new Date(),
        nurtureStep: 0,
        nextNurtureAt: new Date(Date.now() - DAY_MS),
      },
    });

    const res = await runCron("Bearer test-cron-secret");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.skipped).toBeTruthy();
    expect(body.problems).toHaveLength(2);
    expect(sent).toHaveLength(0);
  });

  it("leaves production's three existing subscribers alone (never asked to confirm)", async () => {
    process.env.CRON_SECRET = "test-cron-secret";

    // Same shape as the rows in production: unconfirmed, confirmationSentAt
    // empty, older than 30 days.
    for (const [i, days] of [58, 43, 32].entries()) {
      await prisma.subscriber.create({
        data: {
          email: `existing${i}@example.test`,
          nurtureStep: 3,
          createdAt: new Date(Date.now() - days * DAY_MS),
          subscribedAt: new Date(Date.now() - days * DAY_MS),
        },
      });
    }

    const body = await (await runCron("Bearer test-cron-secret")).json();

    expect(body.purged).toBe(0);
    expect(await prisma.subscriber.count()).toBe(3);
    expect(sent).toHaveLength(0);
  });

  it("deletes only addresses asked to confirm more than 30 days ago that never did", async () => {
    process.env.CRON_SECRET = "test-cron-secret";
    const old = new Date(Date.now() - 31 * DAY_MS);
    const recent = new Date(Date.now() - 5 * DAY_MS);

    await prisma.subscriber.createMany({
      data: [
        { email: "stale@example.test", confirmationSentAt: old },
        { email: "recent@example.test", confirmationSentAt: recent },
        { email: "confirmed@example.test", confirmationSentAt: old, confirmedAt: old },
        { email: "unsubscribed@example.test", confirmationSentAt: old, unsubscribedAt: old },
      ],
    });
    await prisma.demoLead.createMany({
      data: [{ email: "stale@example.test" }, { email: "recent@example.test" }],
    });

    const body = await (await runCron("Bearer test-cron-secret")).json();

    expect(body.purged).toBe(1);
    expect((await prisma.subscriber.findMany({ orderBy: { email: "asc" } })).map((s) => s.email)).toEqual([
      "confirmed@example.test",
      "recent@example.test",
      "unsubscribed@example.test",
    ]);
    expect((await prisma.demoLead.findMany()).map((l) => l.email)).toEqual(["recent@example.test"]);
  });

  it("fully configured: emails confirmed, due subscribers only — with unsubscribe headers", async () => {
    fullyConfigured();
    const yesterday = new Date(Date.now() - DAY_MS);

    await prisma.subscriber.createMany({
      data: [
        { email: "due@example.test", confirmedAt: yesterday, nurtureStep: 0, nextNurtureAt: yesterday },
        { email: "unconfirmed@example.test", nurtureStep: 0, nextNurtureAt: yesterday },
        {
          email: "unsubscribed@example.test",
          confirmedAt: yesterday,
          unsubscribedAt: yesterday,
          nurtureStep: 0,
          nextNurtureAt: yesterday,
        },
        {
          email: "later@example.test",
          confirmedAt: yesterday,
          nurtureStep: 0,
          nextNurtureAt: new Date(Date.now() + DAY_MS),
        },
      ],
    });

    const body = await (await runCron("Bearer test-cron-secret")).json();

    expect(body).toMatchObject({ due: 1, sent: 1, failed: 0 });
    expect(sent.map((m) => m.to)).toEqual(["due@example.test"]);
    expect(sent[0].headers?.["List-Unsubscribe"]).toBeTruthy();
    expect(sent[0].headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");

    const row = await prisma.subscriber.findUniqueOrThrow({ where: { email: "due@example.test" } });
    expect(row.nurtureStep).toBe(1);
    expect(row.nextNurtureAt!.getTime()).toBeGreaterThan(Date.now());

    // Running again the same day sends nothing more.
    const again = await (await runCron("Bearer test-cron-secret")).json();
    expect(again).toMatchObject({ due: 0, sent: 0 });
    expect(sent).toHaveLength(1);
  });

  it("stops emailing someone who has since bought", async () => {
    fullyConfigured();
    const yesterday = new Date(Date.now() - DAY_MS);

    const user = await prisma.user.create({ data: { email: "customer@example.test" } });
    const product = await prisma.product.create({
      data: { id: "prod_x", type: "FLASHCARDS", name: "x", description: "x", priceInCents: 1900 },
    });
    await prisma.purchase.create({
      data: { userId: user.id, productId: product.id, status: "COMPLETED", amountInCents: 1900 },
    });
    await prisma.subscriber.create({
      data: { email: "customer@example.test", confirmedAt: yesterday, nurtureStep: 0, nextNurtureAt: yesterday },
    });

    const body = await (await runCron("Bearer test-cron-secret")).json();

    expect(body).toMatchObject({ sent: 0, skippedCustomers: 1 });
    expect(sent).toHaveLength(0);
  });
});
