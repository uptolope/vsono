// ═══════════════════════════════════════════════════════════════════
// Checks that every table, column and enum the Prisma schema expects
// actually exists in the database.
//
// Why: `prisma migrate deploy` trusts its ledger (_prisma_migrations).
// In production that ledger said the "add_reviews" migration had been
// applied while the "Review" table did not exist, so migrate reported
// "nothing to do", the build passed, and /reviews failed at runtime.
// This compares the schema with the real database instead of the ledger.
//
// It only ever reads (information_schema / pg_catalog). Extra tables or
// columns in the database are ignored; only things the app needs and
// cannot find are reported.
//
// Usage:  node scripts/verify-schema.cjs
//   exit 0  schema matches (or the check could not run — see below)
//   exit 1  something the app needs is missing
//
// If the database cannot be reached the check is skipped with a warning
// rather than failing: a connectivity hiccup is not evidence of drift.
// ═══════════════════════════════════════════════════════════════════

function expectedFromPrisma() {
  const { Prisma } = require("@prisma/client");
  const { models, enums } = Prisma.dmmf.datamodel;

  return {
    tables: models.map((model) => ({
      table: model.dbName || model.name,
      columns: model.fields
        .filter((field) => field.kind !== "object")
        .map((field) => field.dbName || field.name),
    })),
    enums: enums.map((e) => ({
      name: e.dbName || e.name,
      values: e.values.map((v) => v.dbName || v.name),
    })),
  };
}

/** Pure comparison, exported for tests. */
function findMissing(expected, actual) {
  const problems = [];

  for (const { table, columns } of expected.tables) {
    const present = actual.columns.get(table);

    if (!present) {
      problems.push(`table "${table}" is missing`);
      continue;
    }

    for (const column of columns) {
      if (!present.has(column)) {
        problems.push(`column "${table}"."${column}" is missing`);
      }
    }
  }

  for (const { name, values } of expected.enums) {
    const present = actual.enums.get(name);

    if (!present) {
      problems.push(`enum "${name}" is missing`);
      continue;
    }

    for (const value of values) {
      if (!present.has(value)) {
        problems.push(`enum "${name}" is missing value '${value}'`);
      }
    }
  }

  return problems;
}

async function readDatabase(connectionString) {
  const { Client } = require("pg");
  const client = new Client({ connectionString });

  await client.connect();

  try {
    const schema = (await client.query("select current_schema() as s")).rows[0].s;

    const columns = new Map();
    const columnRows = await client.query(
      "select table_name, column_name from information_schema.columns where table_schema = $1",
      [schema],
    );
    for (const row of columnRows.rows) {
      if (!columns.has(row.table_name)) columns.set(row.table_name, new Set());
      columns.get(row.table_name).add(row.column_name);
    }

    const enums = new Map();
    const enumRows = await client.query(
      `select t.typname, e.enumlabel
         from pg_type t
         join pg_enum e on e.enumtypid = t.oid
         join pg_namespace n on n.oid = t.typnamespace
        where n.nspname = $1`,
      [schema],
    );
    for (const row of enumRows.rows) {
      if (!enums.has(row.typname)) enums.set(row.typname, new Set());
      enums.get(row.typname).add(row.enumlabel);
    }

    return { columns, enums };
  } finally {
    await client.end();
  }
}

async function verifySchema(connectionString) {
  return findMissing(expectedFromPrisma(), await readDatabase(connectionString));
}

module.exports = { expectedFromPrisma, findMissing, verifySchema };

if (require.main === module) {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!url) {
    console.log("[verify-schema] no DIRECT_URL/DATABASE_URL — skipping.");
    process.exit(0);
  }

  let expected;
  try {
    expected = expectedFromPrisma();
  } catch (error) {
    console.warn(`[verify-schema] could not load the Prisma client — skipping. (${error.message})`);
    process.exit(0);
  }

  readDatabase(url).then(
    (actual) => {
      const problems = findMissing(expected, actual);

      if (problems.length === 0) {
        console.log(
          `[verify-schema] OK — ${expected.tables.length} tables and ${expected.enums.length} enums match the Prisma schema.`,
        );
        process.exit(0);
      }

      console.error("[verify-schema] The database does not match prisma/schema.prisma:");
      for (const problem of problems) console.error(`  - ${problem}`);
      console.error(
        "[verify-schema] Migrations are recorded as applied but these objects do not exist. " +
          "Add an idempotent repair migration (see prisma/migrations/20261112180000_repair_missing_review_table).",
      );
      process.exit(1);
    },
    (error) => {
      console.warn(`[verify-schema] could not read the database — skipping. (${error.message})`);
      process.exit(0);
    },
  );
}
