import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/reviews/route";
import ReviewsPage from "@/app/reviews/page";
import { createPurchase, createUser, resetDatabase, signInAs } from "./helpers/fixtures";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const VALID = { rating: 5, body: "Really helped me organise my physics review." };

beforeEach(async () => {
  await resetDatabase();
  signInAs(null);
});

describe("/reviews page", () => {
  it("loads with no reviews (this query is what crashed in production)", async () => {
    await expect(ReviewsPage()).resolves.toBeTruthy();
  });
});

describe("/reviews page when the database query fails", () => {
  it("still renders, with a notice, instead of crashing", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const spy = vi.spyOn(prisma.review, "findMany").mockRejectedValueOnce(
      new Error('relation "Review" does not exist'),
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const html = renderToStaticMarkup(await ReviewsPage());

      expect(html).toContain("Reviews can&#x27;t be loaded right now");
      expect(html).not.toContain("does not exist");
      expect(log).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
      log.mockRestore();
    }
  });
});

describe("GET /api/reviews", () => {
  it("returns only approved reviews, newest first, without user ids", async () => {
    const [a, b, c] = await Promise.all([createUser(), createUser(), createUser()]);

    await prisma.review.create({
      data: { userId: a.id, rating: 5, body: "Approved, older.", status: "APPROVED", createdAt: new Date("2026-01-01") },
    });
    await prisma.review.create({
      data: { userId: b.id, rating: 4, body: "Approved, newer.", status: "APPROVED", createdAt: new Date("2026-02-01") },
    });
    await prisma.review.create({
      data: { userId: c.id, rating: 1, body: "Still pending.", status: "PENDING" },
    });

    const res = await GET();
    const { reviews } = await res.json();

    expect(res.status).toBe(200);
    expect(reviews.map((r: { body: string }) => r.body)).toEqual([
      "Approved, newer.",
      "Approved, older.",
    ]);
    expect(Object.keys(reviews[0]).sort()).toEqual(
      ["body", "createdAt", "displayName", "id", "rating"],
    );
  });
});

describe("POST /api/reviews", () => {
  it("requires sign-in", async () => {
    expect((await post(VALID)).status).toBe(401);
  });

  it("refuses users without a completed purchase", async () => {
    const user = await createUser();
    await createPurchase(user.id, { status: "PENDING" });
    signInAs(user.id);

    expect((await post(VALID)).status).toBe(403);
    expect(await prisma.review.count()).toBe(0);
  });

  it("saves a purchaser's review as PENDING", async () => {
    const user = await createUser();
    await createPurchase(user.id);
    signInAs(user.id);

    const res = await post({ ...VALID, displayName: "  Dana  " });

    expect(res.status).toBe(201);
    expect(await prisma.review.findMany()).toMatchObject([
      { userId: user.id, rating: 5, status: "PENDING", displayName: "Dana" },
    ]);

    // Not public until approved.
    expect((await (await GET()).json()).reviews).toEqual([]);
  });

  it("rejects invalid input with 400, including a non-JSON body", async () => {
    const user = await createUser();
    await createPurchase(user.id);
    signInAs(user.id);

    expect((await post({ rating: 6, body: VALID.body })).status).toBe(400);
    expect((await post({ rating: 5, body: "too short" })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect(await prisma.review.count()).toBe(0);
  });

  it("allows one review per user", async () => {
    const user = await createUser();
    await createPurchase(user.id);
    signInAs(user.id);

    expect((await post(VALID)).status).toBe(201);
    expect((await post(VALID)).status).toBe(409);
    expect(await prisma.review.count()).toBe(1);
  });

  it("two simultaneous submissions give one 201 and one 409, never a 500", async () => {
    const user = await createUser();
    await createPurchase(user.id);
    signInAs(user.id);

    const statuses = (await Promise.all([post(VALID), post(VALID), post(VALID)]))
      .map((r) => r.status)
      .sort();

    expect(statuses).toEqual([201, 409, 409]);
    expect(await prisma.review.count()).toBe(1);
  });
});
