// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Sonographic Physics licensed PDF metadata (SERVER-SIDE)
//
// This describes the page-image viewer for the licensed board-exam
// PDF. It reuses the existing STUDY_NOTES product and
// checkContentAccess("STUDY_NOTES", ...) — there is no separate
// product type, purchase flow, or entitlement for this content.
// ═══════════════════════════════════════════════════════════════════

/** Product key this content is gated behind. Must match ProductType in prisma/schema.prisma. */
export const SONOGRAPHIC_PHYSICS_PRODUCT_KEY = "STUDY_NOTES" as const;

export const SONOGRAPHIC_PHYSICS_META = {
  title: "SonoPrep™ Sonographic Physics - A Review for Board Exams",
  shortTitle: "Sonographic Physics",
  category: "Board Exam Review",
  /**
   * Verified against the licensed source PDF
   * (SonoPrep™ Sonographic Physics - A Review for Board Exams.pdf)
   * via `pdfjs-dist` page-count check in scripts/render-physics-pages.mjs.
   * This is the single source of truth the page-proxy route validates
   * requests against — do not hand-edit without re-verifying the PDF.
   */
  pageCount: 159,
  downloadsEnabled: false,
  watermarkText: "Licensed access - personal use only - redistribution prohibited",
} as const;

/**
 * Deterministic private Blob pathname for a given page image.
 * Centralized here so the renderer (upload side) and the page proxy
 * (read side) can never drift apart on naming, and so page numbers
 * are the only input that ever reaches a Blob path — no user-supplied
 * strings are interpolated into a path anywhere in the app.
 */
export function blobPathForPage(page: number): string {
  if (!isValidPageNumber(page)) {
    throw new Error(`Invalid page number: ${page}`);
  }
  const padded = String(page).padStart(4, "0");
  return `sonographic-physics/pages/page-${padded}.png`;
}

/**
 * Strict page-number validation shared by the renderer, the upload
 * script, and the page-proxy route. Rejects anything that isn't an
 * integer within [1, pageCount] — including strings, floats, NaN,
 * and out-of-range values — before it can ever be used to build a
 * Blob path.
 */
export function isValidPageNumber(value: unknown): value is number {
  if (typeof value !== "number") return false;
  if (!Number.isInteger(value)) return false;
  return value >= 1 && value <= SONOGRAPHIC_PHYSICS_META.pageCount;
}

/**
 * Parses a page number from an untrusted route param (always a string
 * from the URL). Returns null for anything invalid rather than
 * throwing, so callers can return a clean 400 instead of a 500.
 */
export function parsePageParam(raw: string): number | null {
  // Reject anything that isn't a plain run of digits up front — this
  // also blocks path traversal attempts like "..", "1/../5", etc.
  // before they ever reach Number().
  if (!/^[0-9]+$/.test(raw)) return null;
  const n = Number(raw);
  return isValidPageNumber(n) ? n : null;
}
