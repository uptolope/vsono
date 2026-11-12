import { createRequire } from "node:module";
import { afterAll, describe, expect, it } from "vitest";
import { PRODUCTION_FINGERPRINT_2026_11_12 } from "./fixtures/production-fingerprint";
import {
  dropDatabase,
  fingerprint,
  listMigrations,
  migrateDeploy,
  migrationSql,
  recreateDatabase,
  withClient,
} from "./helpers/db";

const { verifySchema } = createRequire(import.meta.url)(
  "../scripts/verify-schema.cjs",
) as { verifySchema: (url: string) => Promise<string[]> };

/** Last migration production's ledger listed when it was audited. */
const LAST_IN_PROD_LEDGER = "20260929200000_lead_double_opt_in";
const RECONCILE = "20261112175000_reconcile_migration_history_with_production";
const ADD_REVIEWS = "20260921220000_add_reviews";
const REPAIR = "20261112180000_repair_missing_review_table";
const EXAM = "20261112181000_exam_attempt_tracking";

/**
 * What the schema check reports on the production-shaped database: the
 * missing table, plus the columns the new exam migration is about to add.
 * (Identical to what it reported against the real production column list.)
 */
const PRODUCTION_GAPS = [
  'column "ExamSession"."purchaseId" is missing',
  'column "ExamSession"."attemptNumber" is missing',
  'column "ExamSession"."questionIds" is missing',
  'table "Review" is missing',
];

const created: string[] = [];

async function freshDb(suffix: string): Promise<string> {
  const name = `sonoprep_vitest_${suffix}`;
  created.push(name);
  return recreateDatabase(name);
}

/**
 * Reproduces production as audited on 2026-11-12:
 *  - the structure production really has (which is what the reconcile
 *    migration produces — proven against the production fingerprint below),
 *  - a ledger that lists every migration up to lead_double_opt_in and nothing
 *    newer,
 *  - the "ReviewStatus" enum present and the "Review" table missing.
 */
async function driftedDb(suffix: string): Promise<string> {
  const url = await freshDb(suffix);
  await migrateDeploy(url, { upTo: RECONCILE });
  await withClient(url, async (c) => {
    await c.query(`DELETE FROM "_prisma_migrations" WHERE migration_name = $1`, [RECONCILE]);
    await c.query(`DROP TABLE "Review"`);
  });
  return url;
}

async function seedUser(url: string, id = "user_1") {
  await withClient(url, (c) =>
    c.query(
      `INSERT INTO "User" (id, email, "updatedAt") VALUES ($1, $2, now())`,
      [id, `${id}@example.test`],
    ),
  );
}

afterAll(async () => {
  for (const name of created) await dropDatabase(name);
});

describe("migrations on a clean database", () => {
  it("apply in order and produce exactly what the Prisma schema expects", async () => {
    const url = await freshDb("fresh");

    expect(await migrateDeploy(url)).toEqual(listMigrations());
    expect(await verifySchema(url)).toEqual([]);

    // Nothing left to do on a second run.
    expect(await migrateDeploy(url)).toEqual([]);
  });
});

describe("migration history vs production", () => {
  it("a database built from the repo has production's structure", async () => {
    const url = await freshDb("matches_prod");
    await migrateDeploy(url, { upTo: RECONCILE });

    const local = await fingerprint(url);

    // The two intended differences from the 2026-11-12 snapshot:
    //  - "Review" exists here (its absence in production was the bug);
    //  - "User" keeps a legacy, unused "password" column that 0_baseline
    //    created. Dropping a column is not worth the risk; it is harmless.
    const { Review, User, ...rest } = local;
    const { User: prodUser, ...prodRest } = PRODUCTION_FINGERPRINT_2026_11_12;

    expect(rest).toEqual(prodRest);
    expect(Review).toBeTruthy();
    expect(User).not.toEqual(prodUser);

    await withClient(url, async (c) => {
      const extra = await c.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_name = 'User' AND column_name = 'password'`,
      );
      expect(extra.rowCount).toBe(1);
      await c.query(`ALTER TABLE "User" DROP COLUMN "password"`);
    });

    expect((await fingerprint(url)).User).toEqual(prodUser);
  });

  it("the reconcile migration changes nothing on a production-shaped database", async () => {
    const url = await driftedDb("reconcile_noop");
    await seedUser(url);
    await withClient(url, (c) =>
      c.query(
        `INSERT INTO flashcard_progress (id, "userId", "cardId") VALUES ('fp1', 'user_1', 7)`,
      ),
    );

    const before = await fingerprint(url);
    await withClient(url, (c) => c.query(migrationSql(RECONCILE)));
    const after = await fingerprint(url);

    expect(after).toEqual(before);

    await withClient(url, async (c) => {
      expect((await c.query(`SELECT id FROM flashcard_progress`)).rows).toEqual([{ id: "fp1" }]);
      expect((await c.query(`SELECT id FROM "User"`)).rows).toEqual([{ id: "user_1" }]);
    });
  });

  it("the reconcile migration keeps existing rows when it upgrades an old-shape database", async () => {
    const url = await freshDb("reconcile_data");
    await migrateDeploy(url, { upTo: LAST_IN_PROD_LEDGER });
    await seedUser(url);

    await withClient(url, async (c) => {
      await c.query(
        `INSERT INTO "Product" (id, type, name, description, "priceInCents", "updatedAt")
         VALUES ('p', 'EXAM_SIMULATOR', 'x', 'x', 1900, now())`,
      );
      await c.query(
        `INSERT INTO "Purchase" (id, "userId", "productId", "amountInCents", "accessExpiresAt", "updatedAt")
         VALUES ('pu', 'user_1', 'p', 1900, now() + interval '30 days', now())`,
      );
      await c.query(
        `INSERT INTO "FlashcardProgress" (id, "userId", "cardId", box) VALUES ('fp', 'user_1', 3, 2)`,
      );
      await c.query(
        `INSERT INTO "StudyNoteProgress" (id, "userId", "chapterId", progress) VALUES ('sn', 'user_1', 4, 0.5)`,
      );
      await c.query(
        `INSERT INTO "ExamSession" (id, "userId", "totalQuestions") VALUES ('es', 'user_1', 110)`,
      );
      await c.query(
        `INSERT INTO "ExamAnswer" (id, "sessionId", "questionId", "selectedIndex", "isCorrect")
         VALUES ('old-text-id', 'es', 12, 1, true)`,
      );
      await c.query(
        `INSERT INTO "AuditLog" (id, "userId", action) VALUES ('al1', 'user_1', 'login'), ('al2', 'ghost', 'login')`,
      );
      await c.query(
        `INSERT INTO "VerificationToken" (identifier, token, expires) VALUES ('a@b.test', 'tok', now())`,
      );
    });

    await migrateDeploy(url);
    expect(await verifySchema(url)).toEqual([]);

    await withClient(url, async (c) => {
      expect((await c.query(`SELECT id, box, "timeSpentMs" FROM flashcard_progress`)).rows).toEqual([
        { id: "fp", box: 2, timeSpentMs: 0 },
      ]);
      expect((await c.query(`SELECT id, progress FROM study_note_progress`)).rows).toEqual([
        { id: "sn", progress: 0.5 },
      ]);
      // The answer survives, gets a numeric id and its owner from the session.
      expect(
        (await c.query(`SELECT id, "userId", "questionId", "isCorrect" FROM "ExamAnswer"`)).rows,
      ).toEqual([{ id: 1, userId: "user_1", questionId: 12, isCorrect: true }]);
      expect((await c.query(`SELECT status, "accessExpiresAt" IS NOT NULL AS has_expiry FROM "Purchase"`)).rows).toEqual([
        { status: "COMPLETED", has_expiry: true },
      ]);
      // The orphaned audit row is kept, just detached from the missing user.
      expect((await c.query(`SELECT id, "userId" FROM "AuditLog" ORDER BY id`)).rows).toEqual([
        { id: "al1", userId: "user_1" },
        { id: "al2", userId: null },
      ]);
      expect((await c.query(`SELECT token FROM "VerificationToken"`)).rows).toEqual([{ token: "tok" }]);
    });
  });
});

describe("the production Review drift", () => {
  it("is reproduced: ledger says applied, enum exists, table is missing", async () => {
    const url = await driftedDb("drift_state");

    await withClient(url, async (c) => {
      const ledger = await c.query(
        `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
        [ADD_REVIEWS],
      );
      expect(ledger.rowCount).toBe(1);

      const enumExists = await c.query(
        `SELECT 1 FROM pg_type WHERE typname = 'ReviewStatus'`,
      );
      expect(enumExists.rowCount).toBe(1);

      await expect(c.query(`SELECT 1 FROM "Review"`)).rejects.toThrow(
        /relation "Review" does not exist/,
      );
    });

    expect(await verifySchema(url)).toEqual(PRODUCTION_GAPS);
  });

  it("is NOT fixed by re-deploying the existing migrations (the ledger hides it)", async () => {
    const url = await driftedDb("drift_redeploy");

    expect(await migrateDeploy(url, { upTo: LAST_IN_PROD_LEDGER })).toEqual([]);
    expect(await verifySchema(url)).toEqual(PRODUCTION_GAPS);
  });

  it("cannot be fixed by re-running the original migration by hand", async () => {
    const url = await driftedDb("drift_rerun");

    await withClient(url, async (c) => {
      await expect(c.query(migrationSql(ADD_REVIEWS))).rejects.toThrow(
        /type "ReviewStatus" already exists/,
      );
    });
  });

  it("is fixed by the repair migration, which leaves the schema complete", async () => {
    const url = await driftedDb("drift_repair");
    await seedUser(url);

    expect(await migrateDeploy(url)).toEqual([RECONCILE, REPAIR, EXAM]);
    expect(await verifySchema(url)).toEqual([]);

    await withClient(url, async (c) => {
      await c.query(
        `INSERT INTO "Review" (id, "userId", rating, body, "updatedAt")
         VALUES ('r1', 'user_1', 5, 'A review that is long enough.', now())`,
      );

      const row = (await c.query(`SELECT status, "createdAt" FROM "Review"`)).rows[0];
      expect(row.status).toBe("PENDING");
      expect(row.createdAt).toBeInstanceOf(Date);

      // One review per user.
      await expect(
        c.query(
          `INSERT INTO "Review" (id, "userId", rating, body, "updatedAt")
           VALUES ('r2', 'user_1', 4, 'Second review, same user.', now())`,
        ),
      ).rejects.toThrow(/Review_userId_key/);

      // Reviews go when the user goes.
      await c.query(`DELETE FROM "User" WHERE id = 'user_1'`);
      expect((await c.query(`SELECT 1 FROM "Review"`)).rowCount).toBe(0);

      const indexes = (
        await c.query(
          `SELECT indexname FROM pg_indexes WHERE tablename = 'Review' ORDER BY 1`,
        )
      ).rows.map((r) => r.indexname);
      expect(indexes).toEqual([
        "Review_pkey",
        "Review_status_createdAt_idx",
        "Review_userId_key",
      ]);
    });
  });

  it("repair is idempotent and never touches existing reviews", async () => {
    const url = await driftedDb("drift_idempotent");
    await seedUser(url);
    await migrateDeploy(url);

    await withClient(url, async (c) => {
      await c.query(
        `INSERT INTO "Review" (id, "userId", rating, body, "updatedAt")
         VALUES ('keep', 'user_1', 5, 'This row must survive.', now())`,
      );

      await c.query(migrationSql(REPAIR));
      await c.query(migrationSql(REPAIR));

      expect((await c.query(`SELECT id FROM "Review"`)).rows).toEqual([{ id: "keep" }]);

      const fks = await c.query(
        `SELECT 1 FROM pg_constraint WHERE conname = 'Review_userId_fkey'`,
      );
      expect(fks.rowCount).toBe(1);
    });
  });

  it("still deploys cleanly when the repair SQL was already run by hand", async () => {
    // The order used for production: SQL applied first, ledger caught up by
    // the next `prisma migrate deploy`.
    const url = await driftedDb("drift_preapplied");

    await withClient(url, (c) => c.query(migrationSql(REPAIR)));
    expect(await verifySchema(url)).toEqual([
      'column "ExamSession"."purchaseId" is missing',
      'column "ExamSession"."attemptNumber" is missing',
      'column "ExamSession"."questionIds" is missing',
    ]);

    expect(await migrateDeploy(url)).toEqual([RECONCILE, REPAIR, EXAM]);
    expect(await verifySchema(url)).toEqual([]);
  });

  it("creates Review locked down: other roles see nothing, the owner sees everything", async () => {
    const url = await driftedDb("drift_rls");
    await seedUser(url);
    await migrateDeploy(url);

    await withClient(url, async (c) => {
      const rls = await c.query(
        `SELECT relrowsecurity FROM pg_class WHERE relname = 'Review'`,
      );
      expect(rls.rows[0].relrowsecurity).toBe(true);

      await c.query(
        `INSERT INTO "Review" (id, "userId", rating, body, "updatedAt")
         VALUES ('r1', 'user_1', 5, 'Visible to the app only.', now())`,
      );

      // Stand-in for Supabase's `anon` role: granted everything, like
      // Supabase's default privileges do.
      await c.query(`DROP ROLE IF EXISTS vitest_anon`);
      await c.query(`CREATE ROLE vitest_anon NOLOGIN`);
      await c.query(`GRANT USAGE ON SCHEMA public TO vitest_anon`);
      await c.query(`GRANT ALL ON "Review" TO vitest_anon`);

      await c.query(`SET ROLE vitest_anon`);
      expect((await c.query(`SELECT 1 FROM "Review"`)).rowCount).toBe(0);
      await expect(
        c.query(
          `INSERT INTO "Review" (id, "userId", rating, body, "updatedAt")
           VALUES ('evil', 'user_1', 1, 'Should be refused by RLS.', now())`,
        ),
      ).rejects.toThrow(/row-level security/);
      await c.query(`RESET ROLE`);

      expect((await c.query(`SELECT 1 FROM "Review"`)).rowCount).toBe(1);

      await c.query(`REVOKE ALL ON "Review" FROM vitest_anon`);
      await c.query(`REVOKE USAGE ON SCHEMA public FROM vitest_anon`);
      await c.query(`DROP ROLE vitest_anon`);
    });
  });
});

describe("exam attempt constraints", () => {
  it("the database itself refuses a 4th attempt or a duplicate attempt number", async () => {
    const url = await freshDb("exam_constraints");
    await migrateDeploy(url);
    await seedUser(url);

    await withClient(url, async (c) => {
      await c.query(
        `INSERT INTO "Product" (id, type, name, description, "priceInCents", "updatedAt")
         VALUES ('p', 'EXAM_SIMULATOR', 'x', 'x', 1900, now())`,
      );
      await c.query(
        `INSERT INTO "Purchase" (id, "userId", "productId", status, "amountInCents", "updatedAt")
         VALUES ('pu', 'user_1', 'p', 'COMPLETED', 1900, now())`,
      );

      const insert = (id: string, n: number | null, purchase: string | null = "pu") =>
        c.query(
          `INSERT INTO "ExamSession" (id, "userId", "totalQuestions", "purchaseId", "attemptNumber")
           VALUES ($1, 'user_1', 110, $2, $3)`,
          [id, purchase, n],
        );

      await insert("a1", 1);
      await insert("a2", 2);
      await insert("a3", 3);

      await expect(insert("a4", 4)).rejects.toThrow(/ExamSession_attemptNumber_range/);
      await expect(insert("a0", 0)).rejects.toThrow(/ExamSession_attemptNumber_range/);
      await expect(insert("dup", 2)).rejects.toThrow(
        /ExamSession_purchaseId_attemptNumber_key/,
      );

      // Rows from before attempt tracking (no purchase, no number) stay valid.
      await insert("legacy1", null, null);
      await insert("legacy2", null, null);

      const defaults = await c.query(
        `SELECT "questionIds" FROM "ExamSession" WHERE id = 'legacy1'`,
      );
      expect(defaults.rows[0].questionIds).toEqual([]);
    });
  });
});
