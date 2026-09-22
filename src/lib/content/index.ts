// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Content Access Layer (SERVER-SIDE ONLY)
// Central module for accessing protected educational content
// ═══════════════════════════════════════════════════════════════════

export { FLASHCARDS, FLASHCARD_CATEGORIES, calculateSM2 } from "./flashcard-data";
export type { Flashcard, FlashcardCategory, SM2Result } from "./flashcard-data";

export {
  EXAM_QUESTIONS,
  EXAM_DOMAIN_INFO,
  TOTAL_EXAM_QUESTIONS,
  TOTAL_EXAM_DOMAINS,
  toClientQuestions,
  shuffleQuestions,
} from "./exam-data";
export type { ExamQuestion, ClientExamQuestion, ExamDomain } from "./exam-data";

export { PHYSICS_PEARLS } from "./physics-pearls-data";
export type { PhysicsPearl } from "./physics-pearls-data";

export { STUDY_SECTIONS } from "./study-notes-data";
export type { StudySection, StudyCard, Formula, ComparisonTable } from "./study-notes-data";

// ── Product type mapping ─────────────────────────────────────────
export const PRODUCT_CONTENT_MAP = {
  FLASHCARDS: "FLASHCARDS",
  EXAM_SIMULATOR: "EXAM_SIMULATOR",
  PHYSICS_PEARLS: "PHYSICS_PEARLS",
  STUDY_NOTES: "STUDY_NOTES",
  PREMIUM_BUNDLE: "PREMIUM_BUNDLE",
} as const;

export type ProductContentKey = keyof typeof PRODUCT_CONTENT_MAP;

/** Products included in the Premium Bundle */
export const BUNDLE_INCLUDES: ProductContentKey[] = [
  "FLASHCARDS",
  "EXAM_SIMULATOR",
  "PHYSICS_PEARLS",
  "STUDY_NOTES",
];

/**
 * Number of questions drawn per exam attempt.
 * Intentionally fixed at 110 to mirror the real ARDMS SPI exam format
 * (110 multiple-choice questions, 2.5-hour time limit — see faq-data.ts),
 * independent of how large the underlying question bank is.
 */
export const QUESTIONS_PER_ATTEMPT = 110;