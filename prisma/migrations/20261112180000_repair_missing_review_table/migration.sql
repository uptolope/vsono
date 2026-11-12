-- Schema-drift repair: production's _prisma_migrations ledger records
-- 20260921220000_add_reviews as applied, and the "ReviewStatus" enum exists,
-- but the "Review" table itself is missing. /reviews and /api/reviews
-- therefore fail with "relation \"Review\" does not exist".
--
-- `prisma migrate deploy` will never re-run a migration it believes is
-- applied, and re-running the original by hand fails on CREATE TYPE. So this
-- migration recreates exactly what 20260921220000_add_reviews defines, with
-- every statement idempotent:
--   * drifted database (enum present, table missing) -> table is created
--   * healthy database (fresh install, or already repaired) -> no-op
--
-- It never drops or rewrites anything.

DO $$
BEGIN
    CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "displayName" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_key" ON "Review"("userId");

CREATE INDEX IF NOT EXISTS "Review_status_createdAt_idx"
    ON "Review"("status", "createdAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Review_userId_fkey'
          AND conrelid = '"Review"'::regclass
    ) THEN
        ALTER TABLE "Review"
            ADD CONSTRAINT "Review_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- Supabase exposes the public schema through its REST API and grants the
-- anon/authenticated roles table privileges by default. Every other table in
-- this database has row level security switched on so those roles can read
-- and write nothing; a table created without it would be world-readable and
-- world-writable with the public anon key. The app is unaffected: it connects
-- through Prisma as the table owner, which is not subject to RLS.
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- Same explicit policy the other tables carry. With RLS on and no policy the
-- result is already "deny"; this makes the intent visible in the dashboard
-- and keeps Supabase's security advisor quiet.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = current_schema()
          AND tablename = 'Review'
          AND policyname = 'Deny all access'
    ) THEN
        CREATE POLICY "Deny all access" ON "Review"
            AS RESTRICTIVE FOR ALL TO public
            USING (false);
    END IF;
END
$$;
