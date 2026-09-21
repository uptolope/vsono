// Standalone content audit — no build step or test framework required.
// Run: node scripts/audit-content.mjs
// Fails (non-zero exit) if the exam/demo banks violate the compliance rules.

import { execSync } from "node:child_process";
import fs from "node:fs";

let failures = [];
const fail = (msg) => failures.push(msg);

function extractIds(src, pattern) {
  return [...src.matchAll(pattern)].map((m) => m[1]);
}

// ---- Paid 155-question bank ----
const examSrcFull = fs.readFileSync("src/lib/content/exam-data.ts", "utf8");
// Bound to the array literal only — the trailing validation function's
// source text can itself contain matching substrings and must not be
// mistaken for the last question's block.
const arrayStart = examSrcFull.indexOf("EXAM_QUESTIONS: ExamQuestion[] = [");
const arrayEnd = examSrcFull.indexOf("\n];", arrayStart);
const examSrc =
  arrayStart !== -1 && arrayEnd !== -1
    ? examSrcFull.slice(arrayStart, arrayEnd)
    : examSrcFull;
const numericIds = extractIds(examSrc, /\bid:\s*(\d+)/g).map(Number);
if (numericIds.length !== 155) fail(`Expected 155 records, found ${numericIds.length}`);
const uniqueIds = new Set(numericIds);
if (uniqueIds.size !== numericIds.length) fail("Duplicate IDs found in exam-data.ts");
for (let i = 1; i <= 155; i++) {
  if (!uniqueIds.has(i)) fail(`Missing ID ${i} from exam-data.ts (must be 1-155, gap-free)`);
}
for (const id of uniqueIds) {
  if (id < 1 || id > 155) fail(`ID ${id} is outside the authorized 1-155 range`);
}

// Mandatory-14 editorial audit
const blocks = examSrc.split(/(?=\{\s*\n?\s*id:\s*\d+)/);
const correctedIds = [];
for (const b of blocks) {
  const idm = b.match(/id:\s*(\d+)/);
  if (!idm) continue;
  const isCorrected = /editorially_corrected/.test(b);
  if (isCorrected) {
    correctedIds.push(Number(idm[1]));
    if (!/editorialNote:\s*"[^"]+"/.test(b) && !/editorialNote:\s*'[^']+'/.test(b) && !/editorialNote:\s*`[^`]+`/.test(b)) {
      fail(`Question ${idm[1]} is marked editorially_corrected but has no non-empty editorialNote`);
    }
  }
}
const MANDATORY_14 = [43, 61, 70, 83, 84, 91, 103, 105, 108, 130, 136, 139, 141, 154];
for (const id of MANDATORY_14) {
  if (!correctedIds.includes(id)) fail(`Mandatory editorial ID ${id} is not marked editorially_corrected`);
}

// Constants
if (!/export const TOTAL_EXAM_QUESTIONS = EXAM_QUESTIONS\.length;/.test(examSrcFull)) {
  fail("TOTAL_EXAM_QUESTIONS must be derived from EXAM_QUESTIONS.length");
}
const indexSrc = fs.readFileSync("src/lib/content/index.ts", "utf8");
if (!/export const QUESTIONS_PER_ATTEMPT = 110;/.test(indexSrc)) {
  fail("QUESTIONS_PER_ATTEMPT must equal 110 in src/lib/content/index.ts");
}
try {
  const grep = execSync("grep -rn \"EXAM_QUESTION_COUNT\" src || true", { encoding: "utf8" });
  if (grep.trim()) fail(`Stale EXAM_QUESTION_COUNT alias still referenced:\n${grep}`);
} catch {
  /* grep not available in this environment */
}

// ---- Demo bank (10-question) ----
const demoSrc = fs.readFileSync("src/lib/demo/exam-data.ts", "utf8");
const demoIds = extractIds(demoSrc, /id:\s*"(Q\d+)"/g);
if (demoIds.length !== 10) fail(`Expected 10 demo questions, found ${demoIds.length}`);
const demoUnique = new Set(demoIds);
if (demoUnique.size !== 10) fail("Duplicate demo question IDs found");
for (let i = 1; i <= 10; i++) {
  if (!demoUnique.has(`Q${i}`)) fail(`Demo bank missing Q${i}`);
}
if (!/export const DEMO_QUESTIONS_PER_ATTEMPT = 10;/.test(demoSrc)) {
  fail("DEMO_QUESTIONS_PER_ATTEMPT must equal 10");
}

// ---- Unauthorized-source audit: nothing outside the two known banks may
// supply questions to the exam/demo features ----
try {
  const grep = execSync(
    "grep -rIln \"question:\\|correctAnswer\" src --include=*.ts --include=*.tsx | grep -v node_modules || true",
    { encoding: "utf8" }
  );
  const files = grep.split("\n").filter(Boolean);
  const allowed = new Set([
    "src/lib/content/exam-data.ts",
    "src/lib/demo/exam-data.ts",
    // Flashcards are a distinct, unrelated content type (separate product),
    // not part of the exam-question feature this audit governs.
    "src/lib/content/flashcard-data.ts",
    "src/lib/demo/flashcard-data.ts",
  ]);
  // Only flag files that define multiple literal `question:` entries
  // (an actual embedded bank) — not files that merely reference the
  // field name (type defs, grading routes, UI components).
  const unexpected = files.filter((f) => {
    if (allowed.has(f)) return false;
    const body = fs.readFileSync(f, "utf8");
    const literalQuestionCount = (body.match(/question:\s*[`"]/g) || []).length;
    return literalQuestionCount >= 3;
  });
  if (unexpected.length) {
    fail(
      `Found question-shaped data outside the two authoritative banks (review manually — may be false positive from types/tests):\n${unexpected.join("\n")}`
    );
  }
} catch {
  /* ignore */
}

if (failures.length) {
  console.error("CONTENT AUDIT FAILED:\n" + failures.map((f) => " - " + f).join("\n"));
  process.exit(1);
} else {
  console.log("CONTENT AUDIT PASSED: 155-question bank OK, mandatory-14 OK, 10-question demo bank OK.");
  process.exit(0);
}
