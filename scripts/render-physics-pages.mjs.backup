#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// One-time local renderer: licensed PDF -> validated page PNGs ->
// private Vercel Blob.
//
// Plain Node ESM. No ts-node/tsx. Approved deps only: pdfjs-dist,
// canvas (local rendering only), @vercel/blob (upload only).
//
// Usage:
//   node scripts/render-physics-pages.mjs --pdf <path> --dry-run
//   node scripts/render-physics-pages.mjs --pdf <path> --upload
//
// --dry-run (default if --upload is not passed): renders and
//   validates every page into a local scratch directory (git-ignored,
//   outside public/) and reports pass/fail. Uploads nothing.
// --upload: same render + validation, and only on full success,
//   uploads validated pages to private Vercel Blob using
//   BLOB_READ_WRITE_TOKEN. Requires the token to be set; requires a
//   local PDF path. Never uploads anything unvalidated.
//
// ─── Diagnosis of the "159 blank PNGs, all identical size" bug ─────
// This happens when pdfjs is given the *default* Node canvas factory
// instead of one backed by the real `canvas` package. In Node, pdfjs
// has no DOM to allocate a real 2D drawing surface from — without an
// explicit `canvasFactory` wired to `canvas.createCanvas`, the render
// call resolves successfully (no thrown error) but nothing is ever
// actually painted, so every page comes out as the same blank
// dimensions -> the same trivially-compressible all-white PNG bytes.
// The fix is to (a) import the *legacy* Node-targeted pdfjs build,
// (b) implement and pass a NodeCanvasFactory using `canvas`, and
// (c) point pdfjs at its bundled standard font data so embedded/
// non-embedded fonts resolve instead of silently drawing nothing.
// ═══════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CLI args ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
}
const PDF_PATH = getArg("pdf");
const DO_UPLOAD = args.includes("--upload");
const OUT_DIR =
  getArg("out") || path.join(os.tmpdir(), "sonoprep-physics-render");

const EXPECTED_PAGE_COUNT = 159;

function fail(msg) {
  console.error(`[render-physics-pages] FAIL: ${msg}`);
  process.exit(1);
}

if (!PDF_PATH) {
  fail("Missing required --pdf <path-to-licensed-pdf>");
}
if (!fs.existsSync(PDF_PATH)) {
  fail(`PDF not found at ${PDF_PATH}`);
}

// ── Dependency resolution (approved deps only) ──────────────────
let pdfjsLib, createCanvas, ImageDataCtor;
try {
  // Legacy build is the one meant for non-browser (Node) environments.
  pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
} catch (err) {
  fail(
    `pdfjs-dist is not installed / legacy build unavailable (${err.message}). ` +
      `Run "npm install pdfjs-dist" first.`
  );
}
try {
  const canvasPkg = require("canvas");
  createCanvas = canvasPkg.createCanvas;
  ImageDataCtor = canvasPkg.ImageData;
} catch (err) {
  fail(
    `"canvas" package is not installed (${err.message}). It is the approved ` +
      `local rasterization dependency for this script — run "npm install canvas". ` +
      `Do not substitute another renderer without explicit approval.`
  );
}

// pdfjs's legacy build runs its worker logic on the main thread in
// Node as long as no workerSrc/workerPort is configured — do not set
// GlobalWorkerOptions.workerSrc here, that's for browser bundles and
// pointing it at a nonexistent path is a separate way to get silent
// blank renders.

// Some pdfjs internals reference these DOM globals even off the
// main rendering path (color spaces, image decoding). The legacy
// build expects the embedder to provide them in Node.
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = ImageDataCtor;
}

// Resolve pdfjs's bundled standard fonts so non-embedded standard
// fonts (Helvetica, Times, etc.) resolve to real glyphs instead of
// silently drawing nothing. This is required even when a PDF's fonts
// are "embedded" for page 5/etc., because pdfjs still consults this
// for fallback glyph metrics.
const pdfjsDistDir = path.dirname(require.resolve("pdfjs-dist/package.json"));
const STANDARD_FONT_DATA_URL =
  path.join(pdfjsDistDir, "standard_fonts") + path.sep;
const CMAP_URL = path.join(pdfjsDistDir, "cmaps") + path.sep;

// ── Node canvas factory (the actual fix) ────────────────────────
class NodeCanvasFactory {
  create(width, height) {
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size");
    }
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

// ── Validation helpers ───────────────────────────────────────────
/** Counts non-white pixels by sampling every Nth pixel (fast, reliable enough to catch fully-blank pages). */
function countNonWhitePixels(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let nonWhite = 0;
  // RGBA, sample every pixel — pages are a few hundred KB of pixels,
  // cheap enough to check exactly rather than sample.
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    // Treat fully-transparent as "blank" too, not just white.
    if (a !== 0 && (r < 250 || g < 250 || b < 250)) {
      nonWhite++;
    }
  }
  return nonWhite;
}

function sha1(buf) {
  return require("node:crypto").createHash("sha1").update(buf).digest("hex");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[render-physics-pages] Loading PDF: ${path.basename(PDF_PATH)}`);
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));

  const loadingTask = pdfjsLib.getDocument({
    data,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    // Disable font-face/canvas-text-based rendering shortcuts that
    // assume a DOM; force path-based glyph rendering, which is what
    // actually exercises the canvas factory above.
    disableFontFace: true,
    useSystemFonts: false,
  });
  const pdfDocument = await loadingTask.promise;

  // ── 1. Page count check ─────────────────────────────────────
  if (pdfDocument.numPages !== EXPECTED_PAGE_COUNT) {
    fail(
      `Expected exactly ${EXPECTED_PAGE_COUNT} pages, got ${pdfDocument.numPages}. ` +
        `Aborting before any rendering or upload.`
    );
  }
  console.log(`[render-physics-pages] Page count verified: ${pdfDocument.numPages}`);

  const canvasFactory = new NodeCanvasFactory();
  const results = []; // { page, filePath, bytes, nonWhitePixels, width, height, hash }
  const failures = [];

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    // Fixed scale chosen for legible board-exam diagrams/text at
    // typical viewer zoom without producing unreasonably large PNGs.
    const viewport = page.getViewport({ scale: 2.0 });

    const canvasAndContext = canvasFactory.create(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );

    const renderTask = page.render({
      canvasContext: canvasAndContext.context,
      viewport,
      canvasFactory,
    });
    await renderTask.promise;

    const nonWhitePixels = countNonWhitePixels(canvasAndContext.canvas);
    const pngBuffer = canvasAndContext.canvas.toBuffer("image/png");
    const filePath = path.join(
      OUT_DIR,
      `page-${String(pageNum).padStart(4, "0")}.png`
    );
    fs.writeFileSync(filePath, pngBuffer);

    const record = {
      page: pageNum,
      filePath,
      bytes: pngBuffer.length,
      nonWhitePixels,
      width: canvasAndContext.canvas.width,
      height: canvasAndContext.canvas.height,
      hash: sha1(pngBuffer),
    };
    results.push(record);

    if (nonWhitePixels === 0) {
      failures.push(`Page ${pageNum} rendered fully blank (0 non-white pixels).`);
    }

    canvasFactory.destroy(canvasAndContext);
    page.cleanup();

    if (pageNum % 20 === 0 || pageNum === pdfDocument.numPages) {
      console.log(`[render-physics-pages] Rendered ${pageNum}/${pdfDocument.numPages}`);
    }
  }

  // ── 2. Byte-identical-page detection ────────────────────────
  const byHash = new Map();
  for (const r of results) {
    if (!byHash.has(r.hash)) byHash.set(r.hash, []);
    byHash.get(r.hash).push(r.page);
  }
  for (const [, pages] of byHash) {
    if (pages.length > 1) {
      failures.push(
        `Pages ${pages.join(", ")} are byte-identical (hash collision) — ` +
          `almost certainly indicates blank/stuck rendering, not real content.`
      );
    }
  }

  // ── 3. Representative page spot-check (page 5 explicitly, plus a spread) ──
  const spotCheckPages = new Set([1, 5, Math.floor(EXPECTED_PAGE_COUNT / 2), EXPECTED_PAGE_COUNT]);
  console.log("[render-physics-pages] Spot-check results:");
  for (const r of results) {
    if (spotCheckPages.has(r.page)) {
      console.log(
        `  page ${r.page}: ${r.width}x${r.height}, ${r.bytes} bytes, ` +
          `${r.nonWhitePixels} non-white pixels`
      );
      if (r.page === 5 && r.nonWhitePixels < 100) {
        failures.push(
          `Page 5 is expected to have substantial content (thousands of drawing ` +
            `ops/text items per the source PDF) but only has ${r.nonWhitePixels} non-white pixels.`
        );
      }
    }
  }

  // ── 4. Report ────────────────────────────────────────────────
  if (failures.length > 0) {
    console.error("[render-physics-pages] Validation FAILED:");
    for (const f of failures) console.error(`  - ${f}`);
    console.error(`[render-physics-pages] Rendered files kept at: ${OUT_DIR} for inspection.`);
    console.error(`[render-physics-pages] No upload will be performed.`);
    process.exit(1);
  }

  console.log(
    `[render-physics-pages] Validation PASSED: all ${results.length} pages non-blank, ` +
      `correctly sized, no duplicate content, page 5 confirmed non-trivial.`
  );
  console.log(`[render-physics-pages] Rendered files at: ${OUT_DIR}`);

  if (!DO_UPLOAD) {
    console.log("[render-physics-pages] Dry run complete. Pass --upload to upload to private Blob.");
    return;
  }

  // ── 5. Upload (only reached after full validation passes) ────
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    fail(
      "BLOB_READ_WRITE_TOKEN is not set. Rendering/validation succeeded, but " +
        "upload was requested without a token. Set the env var and re-run with --upload."
    );
  }

  let put;
  try {
    ({ put } = await import("@vercel/blob"));
  } catch (err) {
    fail(`@vercel/blob is not installed (${err.message}). Run "npm install @vercel/blob".`);
  }

  // NOTE: src/lib/content/sonographic-physics.ts is the source of truth
  // for this path scheme (blobPathForPage). It's TypeScript and this is
  // a plain Node script with no TS loader, so the same deterministic
  // scheme is duplicated here — keep the two in sync if either changes.
  const pathFor = (n) => `sonographic-physics/pages/page-${String(n).padStart(4, "0")}.png`;

  console.log(`[render-physics-pages] Uploading ${results.length} validated pages to private Blob...`);
  for (const r of results) {
    const buf = fs.readFileSync(r.filePath);
    await put(pathFor(r.page), buf, {
      access: "private",
      token,
      contentType: "image/png",
      addRandomSuffix: false,
    });
  }
  console.log("[render-physics-pages] Upload complete. (Token value never logged.)");
}

main().catch((err) => {
  fail(err && err.message ? err.message : String(err));
});
