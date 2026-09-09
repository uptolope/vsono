// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Sonographic Physics licensed PDF metadata (SERVER-SIDE)
//
// This describes the page-image viewer for the licensed board-exam
// PDF. It reuses the existing STUDY_NOTES product and
// checkContentAccess("STUDY_NOTES", ...) — there is no separate
// product type, purchase flow, or entitlement for this content.
// ═══════════════════════════════════════════════════════════════════

/**
 * Product key this content is gated behind.
 * Must match ProductType in prisma/schema.prisma.
 */
export const SONOGRAPHIC_PHYSICS_PRODUCT_KEY = "STUDY_NOTES" as const;

export const SONOGRAPHIC_PHYSICS_META = {
  title: "SonoPrep™ Sonographic Physics - A Review for Board Exams",
  shortTitle: "Sonographic Physics",
  category: "Board Exam Review",

  /**
   * Verified against the licensed source PDF
   * (SonoPrep™ Sonographic Physics - A Review for Board Exams.pdf)
   * via the pdfjs-dist page-count check in
   * scripts/render-physics-pages.mjs.
   *
   * This is the single source of truth used to validate page requests.
   * Do not change it without re-verifying the source PDF.
   */
  pageCount: 159,

  downloadsEnabled: false,

  watermarkText:
    "Licensed access - personal use only - redistribution prohibited",
} as const;

/**
 * Creates the deterministic private Blob pathname for a page image.
 *
 * The renderer and page-proxy route both use this function so their
 * naming schemes cannot drift apart. Only validated page numbers are
 * used to create Blob paths.
 */
export function blobPathForPage(page: number): string {
  if (!isValidPageNumber(page)) {
    throw new Error(`Invalid page number: ${page}`);
  }

  const padded = String(page).padStart(4, "0");

  return `sonographic-physics/pages/page-${padded}.png`;
}

/**
 * Validates a page number.
 *
 * Accepts only an integer from 1 through pageCount. Rejects:
 * - strings
 * - floats
 * - NaN
 * - Infinity
 * - zero
 * - negative numbers
 * - page numbers above the verified PDF page count
 */
export function isValidPageNumber(value: unknown): value is number {
  if (typeof value !== "number") {
    return false;
  }

  if (!Number.isInteger(value)) {
    return false;
  }

  return (
    value >= 1 &&
    value <= SONOGRAPHIC_PHYSICS_META.pageCount
  );
}

/**
 * Parses and validates a page number from an untrusted route parameter.
 *
 * Route parameters arrive as strings. Only a plain sequence of digits
 * is accepted before conversion to a number. This rejects values such as:
 *
 * - "../1"
 * - "1/../5"
 * - "1.5"
 * - "-1"
 * - "page-1"
 * - encoded/path-like values
 *
 * Returns null for invalid input so callers can return HTTP 400 rather
 * than throwing a server error.
 */
export function parsePageParam(raw: string): number | null {
  if (!/^[0-9]+$/.test(raw)) {
    return null;
  }

  const pageNumber = Number(raw);

  return isValidPageNumber(pageNumber) ? pageNumber : null;
}