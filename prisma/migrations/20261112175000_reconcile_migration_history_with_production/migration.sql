-- Reconciles a database built from this migrations folder with the schema
-- production actually has (and that prisma/schema.prisma describes).
--
-- Background: several schema changes reached production without a migration
-- (most likely `prisma db push`), so 0_baseline describes an older model:
--   * "ExamAnswer".id is TEXT and there is no "userId"
--   * "FlashcardProgress" / "StudyNoteProgress" instead of
--     flashcard_progress / study_note_progress, without their newer columns
--   * flashcard_reviews does not exist
--   * "Purchase" access dates are NOT NULL and status defaults to COMPLETED
--   * "VerificationToken" has no primary key, "AuditLog" no foreign key
-- A new environment created with `prisma migrate deploy` (for example a
-- separate Preview database) would therefore not run the app.
--
-- EVERY statement below is guarded, so on production — where all of this
-- already exists — the whole file changes nothing. It only adds, renames or
-- relaxes; the single column it replaces ("ExamAnswer".id, TEXT -> serial) is
-- one no deployed code has ever written to with the old type.

-- ── ExamAnswer ──────────────────────────────────────────────────────
DO $$
BEGIN
    IF (SELECT data_type FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'ExamAnswer' AND column_name = 'id') = 'text' THEN
        ALTER TABLE "ExamAnswer" DROP CONSTRAINT "ExamAnswer_pkey";
        ALTER TABLE "ExamAnswer" DROP COLUMN "id";
        ALTER TABLE "ExamAnswer" ADD COLUMN "id" SERIAL NOT NULL;
        ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_pkey" PRIMARY KEY ("id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name = 'ExamAnswer' AND column_name = 'userId') THEN
        ALTER TABLE "ExamAnswer" ADD COLUMN "userId" TEXT;
        UPDATE "ExamAnswer" a SET "userId" = s."userId"
          FROM "ExamSession" s WHERE s."id" = a."sessionId";
        ALTER TABLE "ExamAnswer" ALTER COLUMN "userId" SET NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExamAnswer_userId_fkey') THEN
        ALTER TABLE "ExamAnswer"
            ADD CONSTRAINT "ExamAnswer_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "ExamAnswer_userId_idx" ON "ExamAnswer"("userId");

-- ── ExamSession ─────────────────────────────────────────────────────
-- Redundant with the (userId, completed) and (userId, examType) indexes.
DROP INDEX IF EXISTS "ExamSession_userId_idx";

-- ── FlashcardProgress -> flashcard_progress ─────────────────────────
DO $$
BEGIN
    IF to_regclass('"FlashcardProgress"') IS NOT NULL
       AND to_regclass('flashcard_progress') IS NULL THEN
        ALTER TABLE "FlashcardProgress" RENAME TO flashcard_progress;
        ALTER TABLE flashcard_progress
            RENAME CONSTRAINT "FlashcardProgress_pkey" TO flashcard_progress_pkey;
        ALTER TABLE flashcard_progress
            RENAME CONSTRAINT "FlashcardProgress_userId_fkey" TO "flashcard_progress_userId_fkey";
        ALTER INDEX "FlashcardProgress_userId_idx" RENAME TO "flashcard_progress_userId_idx";
        ALTER INDEX "FlashcardProgress_userId_isMastered_idx" RENAME TO "flashcard_progress_userId_isMastered_idx";
        ALTER INDEX "FlashcardProgress_userId_nextReview_idx" RENAME TO "flashcard_progress_userId_nextReview_idx";
        ALTER INDEX "FlashcardProgress_userId_cardId_key" RENAME TO "flashcard_progress_userId_cardId_key";
    END IF;
END
$$;

ALTER TABLE flashcard_progress ADD COLUMN IF NOT EXISTS "timeSpentMs" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE flashcard_progress ALTER COLUMN "lastReviewed" DROP NOT NULL;
ALTER TABLE flashcard_progress ALTER COLUMN "lastReviewed" DROP DEFAULT;
ALTER TABLE flashcard_progress ALTER COLUMN "nextReview" DROP NOT NULL;
ALTER TABLE flashcard_progress ALTER COLUMN "nextReview" DROP DEFAULT;

-- ── flashcard_reviews ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcard_reviews (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" INTEGER NOT NULL,
    "quality" INTEGER NOT NULL,
    "timeSpentMs" INTEGER NOT NULL DEFAULT 0,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT flashcard_reviews_pkey PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "flashcard_reviews_userId_idx" ON flashcard_reviews("userId");
CREATE INDEX IF NOT EXISTS "flashcard_reviews_flashcardId_idx" ON flashcard_reviews("flashcardId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'flashcard_reviews_userId_fkey') THEN
        ALTER TABLE flashcard_reviews
            ADD CONSTRAINT "flashcard_reviews_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- ── StudyNoteProgress -> study_note_progress ────────────────────────
DO $$
BEGIN
    IF to_regclass('"StudyNoteProgress"') IS NOT NULL
       AND to_regclass('study_note_progress') IS NULL THEN
        ALTER TABLE "StudyNoteProgress" RENAME TO study_note_progress;
        ALTER TABLE study_note_progress
            RENAME CONSTRAINT "StudyNoteProgress_pkey" TO study_note_progress_pkey;
        ALTER TABLE study_note_progress
            RENAME CONSTRAINT "StudyNoteProgress_userId_fkey" TO "study_note_progress_userId_fkey";
        ALTER INDEX "StudyNoteProgress_userId_idx" RENAME TO "study_note_progress_userId_idx";
        ALTER INDEX "StudyNoteProgress_userId_chapterId_key" RENAME TO "study_note_progress_userId_chapterId_key";
    END IF;
END
$$;

ALTER TABLE study_note_progress ADD COLUMN IF NOT EXISTS "timeSpentMs" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE study_note_progress ADD COLUMN IF NOT EXISTS "lastStudied" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ── Purchase ────────────────────────────────────────────────────────
-- A PENDING purchase (checkout started, not yet paid) has no access window.
ALTER TABLE "Purchase" ALTER COLUMN "accessExpiresAt" DROP NOT NULL;
ALTER TABLE "Purchase" ALTER COLUMN "accessGrantedAt" DROP NOT NULL;
ALTER TABLE "Purchase" ALTER COLUMN "accessGrantedAt" DROP DEFAULT;
ALTER TABLE "Purchase" ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS "Purchase_productId_idx" ON "Purchase"("productId");
CREATE INDEX IF NOT EXISTS "Purchase_userId_status_idx" ON "Purchase"("userId", "status");
CREATE INDEX IF NOT EXISTS "Purchase_createdAt_idx" ON "Purchase"("createdAt");
DROP INDEX IF EXISTS "Purchase_userId_productId_idx";

-- ── Product / User / rate_limit_buckets ─────────────────────────────
CREATE INDEX IF NOT EXISTS "Product_active_idx" ON "Product"("active");
CREATE INDEX IF NOT EXISTS "Product_stripePriceId_idx" ON "Product"("stripePriceId");
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
ALTER TABLE rate_limit_buckets ALTER COLUMN "count" SET DEFAULT 0;

-- ── AuditLog ────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_userId_fkey') THEN
        -- Rows pointing at users that no longer exist would block the key.
        UPDATE "AuditLog" SET "userId" = NULL
         WHERE "userId" IS NOT NULL
           AND "userId" NOT IN (SELECT "id" FROM "User");

        ALTER TABLE "AuditLog"
            ADD CONSTRAINT "AuditLog_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;

-- ── VerificationToken ───────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                    WHERE conrelid = '"VerificationToken"'::regclass AND contype = 'p') THEN
        DROP INDEX IF EXISTS "VerificationToken_identifier_token_key";
        DROP INDEX IF EXISTS "VerificationToken_token_key";
        ALTER TABLE "VerificationToken"
            ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token");
    END IF;
END
$$;

-- ── Row level security ──────────────────────────────────────────────
-- Production has RLS enabled on every table, which is what keeps Supabase's
-- public REST API (anon key) out of them. Same for any database built from
-- here. The app connects as the table owner and is not affected.
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DemoLead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExamAnswer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExamSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StripeWebhookEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_note_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
