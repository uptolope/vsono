-- Exam attempts become server-side records.
--
-- Until now an "attempt" existed only as a browser cookie holding the drawn
-- question IDs, /api/exam/submit discarded its input, and nothing was written
-- to "ExamSession" or "ExamAnswer". The advertised limit of 3 attempts per
-- purchase was therefore not enforced anywhere.
--
-- Additive only: three nullable/defaulted columns, indexes and constraints.
-- Code deployed before this migration keeps working unchanged.

ALTER TABLE "ExamSession"
    ADD COLUMN "purchaseId" TEXT,
    ADD COLUMN "attemptNumber" INTEGER,
    ADD COLUMN "questionIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- An attempt is charged to the purchase that granted access, so a later
-- purchase starts with its own allowance.
ALTER TABLE "ExamSession"
    ADD CONSTRAINT "ExamSession_purchaseId_fkey"
    FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Hard backstop for the attempt limit (MAX_EXAM_ATTEMPTS in
-- src/lib/exam/attempts.ts). Attempts are numbered 1..3 per purchase and the
-- number is unique per purchase, so a fourth row cannot exist no matter how
-- requests race. Change the limit here and in the code together.
CREATE UNIQUE INDEX "ExamSession_purchaseId_attemptNumber_key"
    ON "ExamSession"("purchaseId", "attemptNumber");

ALTER TABLE "ExamSession"
    ADD CONSTRAINT "ExamSession_attemptNumber_range"
    CHECK ("attemptNumber" IS NULL OR "attemptNumber" BETWEEN 1 AND 3);

CREATE INDEX "ExamSession_userId_startedAt_idx"
    ON "ExamSession"("userId", "startedAt");

-- One saved answer per question per attempt.
CREATE UNIQUE INDEX "ExamAnswer_sessionId_questionId_key"
    ON "ExamAnswer"("sessionId", "questionId");
