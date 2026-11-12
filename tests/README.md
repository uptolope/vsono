# Database-backed tests

These tests exercise the features that depend on the Postgres (Supabase)
database: the migrations themselves, `/reviews`, the exam simulator's attempt
tracking and grading, and the lead-email cron.

They run against a **throwaway local Postgres** — never Supabase. The helper
refuses any `TEST_DATABASE_URL` whose host is not `localhost`/`127.0.0.1`, and
it overwrites `DATABASE_URL` for the test process so application code cannot
reach a real database. No test calls Stripe, Resend or Upstash: purchases are
inserted as rows, email sending is mocked, and rate limiting falls back to its
Postgres table.

## Run

```bash
# any local Postgres 15+ with a superuser, for example:
docker run --rm -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:17

TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres npm test
```

The run creates a database called `sonoprep_vitest` (plus short-lived
`sonoprep_vitest_*` databases for the migration tests), builds it from
`prisma/migrations`, and drops it afterwards.

## What "migrate" means here

`tests/helpers/db.ts` contains a small stand-in for `prisma migrate deploy`:
apply every migration the `_prisma_migrations` ledger does not list, in order,
and record it. That is the behaviour that matters for the drift tests — the
real command also trusts the ledger and never re-runs a recorded migration.
