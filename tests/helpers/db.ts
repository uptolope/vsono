import { createHash, randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

export const MIGRATIONS_DIR = path.resolve(__dirname, "../../prisma/migrations");

/** Name of the database the API tests run against. */
export const TEST_DB_NAME = "sonoprep_vitest";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * The server the tests may create and drop databases on. Deliberately NOT
 * DATABASE_URL, and refused unless it is a local address: these tests create,
 * truncate and drop, and must never be pointed at Supabase.
 */
export function adminUrl(): string {
  const url = process.env.TEST_DATABASE_URL;

  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Point it at a throwaway local Postgres, e.g. " +
        "postgresql://postgres:postgres@localhost:5432/postgres (see tests/README.md).",
    );
  }

  const host = new URL(url).hostname;

  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run tests against "${host}". TEST_DATABASE_URL must be a local Postgres.`,
    );
  }

  return url;
}

export function urlFor(database: string): string {
  const url = new URL(adminUrl());
  url.pathname = `/${database}`;
  return url.toString();
}

export async function withClient<T>(
  url: string,
  run: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

export async function recreateDatabase(name: string): Promise<string> {
  if (!/^[a-z0-9_]+$/.test(name)) throw new Error(`bad database name ${name}`);

  await withClient(adminUrl(), async (admin) => {
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${name}"`);
  });

  return urlFor(name);
}

export async function dropDatabase(name: string): Promise<void> {
  await withClient(adminUrl(), (admin) =>
    admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`),
  );
}

export function listMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function migrationSql(name: string): string {
  return readFileSync(path.join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");
}

const LEDGER_DDL = `
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  )`;

/**
 * Stand-in for `prisma migrate deploy`: applies every migration that the
 * ledger does not list, in name order, each in its own transaction, and
 * records it. Like the real command it trusts the ledger and never re-runs
 * a recorded migration.
 *
 * (The real CLI needs Prisma's schema engine binary; this keeps the tests
 * runnable anywhere and makes the ledger behaviour explicit.)
 */
export async function migrateDeploy(
  url: string,
  options: { upTo?: string } = {},
): Promise<string[]> {
  return withClient(url, async (client) => {
    await client.query(LEDGER_DDL);

    const applied = new Set(
      (
        await client.query(
          `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`,
        )
      ).rows.map((row) => row.migration_name as string),
    );

    const ran: string[] = [];

    for (const name of listMigrations()) {
      if (options.upTo && name > options.upTo) break;
      if (applied.has(name)) continue;

      const sql = migrationSql(name);

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO "_prisma_migrations"
             (id, checksum, migration_name, finished_at, applied_steps_count)
           VALUES ($1, $2, $3, now(), 1)`,
          [randomUUID(), createHash("sha256").update(sql).digest("hex"), name],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`migration ${name} failed: ${(error as Error).message}`);
      }

      ran.push(name);
    }

    return ran;
  });
}

/** The query behind tests/fixtures/production-fingerprint.ts. Read-only. */
export const FINGERPRINT_SQL = `
  select t, md5(string_agg(line, E'\\n' order by line)) h from (
    select table_name::text t,
           'C '||column_name||' '||udt_name||' '||is_nullable||' '||coalesce(column_default,'-') as line
      from information_schema.columns where table_schema='public'
    union all
    select tablename::text, 'I '||regexp_replace(indexdef, ' USING btree', '')
      from pg_indexes where schemaname='public'
    union all
    select replace(c.conrelid::regclass::text,'"',''), 'K '||c.conname||' '||pg_get_constraintdef(c.oid)
      from pg_constraint c join pg_namespace n on n.oid=c.connamespace
     where n.nspname='public' and c.contype in ('f','c','u')
  ) x where t not in ('game_events','love_notes','_prisma_migrations') group by t order by t`;

export async function fingerprint(url: string): Promise<Record<string, string>> {
  return withClient(url, async (client) => {
    const { rows } = await client.query(FINGERPRINT_SQL);
    return Object.fromEntries(rows.map((row) => [row.t as string, row.h as string]));
  });
}
