-- CreateTable
-- Shared counter for rate limiting, used when Upstash Redis isn't
-- configured (see src/lib/rate-limit.ts). Replaces the old in-memory
-- Map fallback, which gave every serverless instance its own counter.
CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);
