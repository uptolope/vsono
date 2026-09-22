// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Active exam attempt cookie (server-side)
//
// Holds ONLY the ordered list of question IDs for the current active
// attempt — never answers, never correctAnswer. Tamper-safety isn't a
// real concern here (every ID is still validated against the
// authoritative bank on read, and grading in /api/exam/submit is
// self-contained per question ID regardless of order), but it's
// httpOnly anyway since there's no reason for client JS to touch it.
//
// Lifecycle:
//  - GET /api/content/EXAM_SIMULATOR reuses this cookie's order if
//    present and valid, so a browser refresh mid-exam never reshuffles.
//  - POST /api/exam/submit clears it on successful submission, so the
//    next GET (triggered by "Retake Exam") starts a genuinely new,
//    freshly-shuffled attempt.
// ═══════════════════════════════════════════════════════════════════

export const EXAM_ATTEMPT_COOKIE = "sonoprep_exam_attempt";

/** Generous relative to the real ~2.5-hour SPI format; just a safety cap. */
export const EXAM_ATTEMPT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 6;

export interface ExamAttemptCookiePayload {
  orderedIds: number[];
  startedAt: number;
}

export function parseExamAttemptCookie(
  raw: string | undefined,
  validIds: Set<number>,
  expectedLength: number
): ExamAttemptCookiePayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.orderedIds)) return null;
    if (parsed.orderedIds.length !== expectedLength) return null;
    if (new Set(parsed.orderedIds).size !== expectedLength) return null; // no duplicate IDs
    if (!parsed.orderedIds.every((id: unknown) => typeof id === "number" && validIds.has(id))) {
      return null; // every ID must resolve to the authoritative bank
    }
    if (typeof parsed.startedAt !== "number") return null;
    return { orderedIds: parsed.orderedIds, startedAt: parsed.startedAt };
  } catch {
    return null; // malformed — discard safely, caller will start a fresh attempt
  }
}
