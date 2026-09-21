// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Demo attempt state (randomize-once + persist)
//
// Client-only (localStorage). Isolated from the paid exam state, which
// lives server-side per-user. No PII, no server round trip.
// ═══════════════════════════════════════════════════════════════════

import { DEMO_QUESTION_IDS, DEMO_QUESTIONS_PER_ATTEMPT } from "./exam-data";

const STORAGE_KEY = "sonoprep_demo_attempt_v1";

export interface DemoAttemptState {
  orderedIds: string[];
  answers: Record<string, number>;
  currentIndex: number;
  startedAt: number;
  status: "active" | "completed";
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sameOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/** Fresh randomized order. Retries once if identical to the previous attempt. */
export function createNewAttempt(previousOrder?: string[]): DemoAttemptState {
  let order = shuffle(DEMO_QUESTION_IDS as string[]);
  if (previousOrder && sameOrder(order, previousOrder)) {
    order = shuffle(DEMO_QUESTION_IDS as string[]);
  }
  return {
    orderedIds: order,
    answers: {},
    currentIndex: 0,
    startedAt: Date.now(),
    status: "active",
  };
}

function isValid(state: unknown): state is DemoAttemptState {
  if (!state || typeof state !== "object") return false;
  const s = state as Partial<DemoAttemptState>;
  if (!Array.isArray(s.orderedIds)) return false;
  if (s.orderedIds.length !== DEMO_QUESTIONS_PER_ATTEMPT) return false;
  const unique = new Set(s.orderedIds);
  if (unique.size !== s.orderedIds.length) return false; // no duplicate IDs
  if (!s.orderedIds.every((id) => DEMO_QUESTION_IDS.includes(id))) return false; // must resolve to supplied set
  if (typeof s.currentIndex !== "number" || s.currentIndex < 0 || s.currentIndex >= DEMO_QUESTIONS_PER_ATTEMPT) {
    return false;
  }
  if (typeof s.startedAt !== "number") return false;
  if (s.status !== "active" && s.status !== "completed") return false;
  if (!s.answers || typeof s.answers !== "object") return false;
  const answerKeys = Object.keys(s.answers);
  if (!answerKeys.every((id) => s.orderedIds!.includes(id))) return false; // answers scoped to active questions
  return true;
}

/** Load the persisted attempt, if any. A completed attempt is never restored as active. */
export function loadAttempt(): DemoAttemptState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) return null;
    if (parsed.status !== "active") return null;
    return parsed;
  } catch {
    return null; // corrupted/malformed — discard safely
  }
}

export function saveAttempt(state: DemoAttemptState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — demo still works, just won't survive refresh */
  }
}

export function clearAttempt(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

/** Load the active attempt, or start a fresh randomized one (never reusing the immediately previous order). */
export function loadOrStartAttempt(): DemoAttemptState {
  const existing = loadAttempt();
  if (existing) return existing;
  let previousOrder: string[] | undefined;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.orderedIds)) previousOrder = parsed.orderedIds;
      }
    } catch {
      /* ignore */
    }
  }
  const fresh = createNewAttempt(previousOrder);
  saveAttempt(fresh);
  return fresh;
}
