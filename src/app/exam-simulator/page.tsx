

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useProtectedContent } from '@/lib/hooks/useProtectedContent';
import type { ClientExamQuestion } from '@/lib/content/exam-data';

interface ExamContentResponse {
  questions: ClientExamQuestion[];
  expiresAt: string | null;
}

interface ExamSubmitResult {
  sessionId: string;
  correct: number;
  total: number;
  score: number;
  perDomain: Record<string, { correct: number; total: number }>;
}

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PROGRESS_KEY = 'sonoprep_exam_progress_v1';

interface StoredProgress {
  idsKey: string;
  answers: Record<number, number>;
  timeSpentByQuestion: Record<number, number>;
  currentIndex: number;
  examStartedAt: number;
}

function loadStoredProgress(idsKey: string): StoredProgress | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredProgress>;

    if (parsed.idsKey !== idsKey) return null;
    if (typeof parsed.currentIndex !== 'number') return null;
    if (typeof parsed.examStartedAt !== 'number') return null;
    if (!parsed.answers || typeof parsed.answers !== 'object') return null;
    if (
      !parsed.timeSpentByQuestion ||
      typeof parsed.timeSpentByQuestion !== 'object'
    ) {
      return null;
    }

    return parsed as StoredProgress;
  } catch {
    return null;
  }
}

function saveStoredProgress(progress: StoredProgress): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Exam continues even when localStorage is unavailable.
  }
}

function clearStoredProgress(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // No-op.
  }
}

export default function ExamSimulatorPage() {
  const [hasConfirmedExamStart, setHasConfirmedExamStart] = useState(false);
  const [acknowledgedExamWarning, setAcknowledgedExamWarning] =
    useState(false);

  const {
    state,
    refetch,
    sessionStatus,
  } = useProtectedContent<ExamContentResponse>(
    'EXAM_SIMULATOR',
    hasConfirmedExamStart,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(
    Date.now(),
  );
  const [timeSpentByQuestion, setTimeSpentByQuestion] = useState<
    Record<number, number>
  >({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [examStartedAt, setExamStartedAt] = useState<number>(Date.now());
  const [hydratedFromStorage, setHydratedFromStorage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ExamSubmitResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

const questionIdsKey =
  state.status === 'success'
    ? state.data.questions.map((q) => q.id).join(',')
    : null;

useEffect(() => {
  if (
    state.status !== 'success' ||
    questionIdsKey === null
  ) {
    return;
  }

  const stored = loadStoredProgress(questionIdsKey);

  if (stored) {
    setAnswers(stored.answers);
    setTimeSpentByQuestion(stored.timeSpentByQuestion);
    setCurrentIndex(
      Math.min(
        stored.currentIndex,
        state.data.questions.length - 1,
      ),
    );
    setExamStartedAt(stored.examStartedAt);
    setElapsedSeconds(
      Math.max(
        0,
        Math.round(
          (Date.now() - stored.examStartedAt) / 1000,
        ),
      ),
    );
  } else {
    const startedAt = Date.now();

    setAnswers({});
    setTimeSpentByQuestion({});
    setCurrentIndex(0);
    setExamStartedAt(startedAt);
    setElapsedSeconds(0);

    saveStoredProgress({
      idsKey: questionIdsKey,
      answers: {},
      timeSpentByQuestion: {},
      currentIndex: 0,
      examStartedAt: startedAt,
    });
  }

  setQuestionStartedAt(Date.now());
  setHydratedFromStorage(true);
}, [state, questionIdsKey]);

  useEffect(() => {
    if (state.status !== 'success' || !hydratedFromStorage) return;

    const idsKey = state.data.questions.map((q) => q.id).join(',');

    saveStoredProgress({
      idsKey,
      answers,
      timeSpentByQuestion,
      currentIndex,
      examStartedAt,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    answers,
    timeSpentByQuestion,
    currentIndex,
    examStartedAt,
    hydratedFromStorage,
  ]);

  useEffect(() => {
    if (
      state.status !== 'success' ||
      result ||
      !hydratedFromStorage
    ) {
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds(
        Math.max(
          0,
          Math.round((Date.now() - examStartedAt) / 1000),
        ),
      );
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.status, result, hydratedFromStorage, examStartedAt]);

  if (sessionStatus === 'loading') {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">
          Checking your sessionâ€¦
        </p>
      </Centered>
    );
  }

  if (state.status === 'unauthenticated') {
    return (
      <Centered>
        <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold mb-4">
          Sign in required
        </h1>

        <p className="body-readable text-[#8a8279] text-sm mb-8">
          Please log in to access the Exam Simulator.
        </p>

        <Link
          href="/login"
          className="btn-industrial px-6 py-3 text-[10px]"
        >
          SIGN IN â†’
        </Link>
      </Centered>
    );
  }

  if (
    sessionStatus === 'authenticated' &&
    !hasConfirmedExamStart
  ) {
    return (
      <ExamReadinessDialog
        acknowledged={acknowledgedExamWarning}
        onAcknowledgedChange={setAcknowledgedExamWarning}
        onStart={() => setHasConfirmedExamStart(true)}
      />
    );
  }

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">
          Loading Exam Simulatorâ€¦
        </p>
      </Centered>
    );
  }

  if (state.status === 'unauthorized') {
    return (
      <Centered>
        <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold mb-4">
          Purchase required
        </h1>

        <p className="body-readable text-[#8a8279] text-sm mb-8">
          You don&apos;t have an active Exam Simulator purchase. Grab it
          or the Premium Bundle to unlock this content.
        </p>

        <Link
          href="/products"
          className="btn-industrial px-6 py-3 text-[10px]"
        >
          BROWSE PRODUCTS â†’
        </Link>
      </Centered>
    );
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <p className="text-[#c85b3a] text-sm mb-6">
          {state.message}
        </p>

        <button
          onClick={refetch}
          className="btn-industrial px-6 py-3 text-[10px]"
        >
          RELOAD â†’
        </button>
      </Centered>
    );
  }

  const { questions } = state.data;

  if (!questions || questions.length === 0) {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm mb-6">
          No exam questions are available right now. Check back soon.
        </p>
      </Centered>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen pt-28 px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/account"
            className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 inline-block transition-colors"
          >
            BACK TO ACCOUNT
          </Link>

          <div className="text-center mb-10">
            <p className="meta text-[10px] text-[#c85b3a] mb-2">
              RESULTS
            </p>

            <h1 className="display-serif text-3xl sm:text-4xl text-white font-semibold mb-2">
              {result.correct}/{result.total} correct ({result.score}%)
            </h1>

            <p className="body-readable text-[#8a8279] text-sm">
              Saved to your account. Domain breakdown below.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(result.perDomain).map(
              ([domain, stats]) => {
                const pct =
                  stats.total > 0
                    ? Math.round((stats.correct / stats.total) * 100)
                    : 0;

                return (
                  <div key={domain}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#c2bab0]">
                        {domain}
                      </span>

                      <span className="text-[#8a8279]">
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>

                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            pct >= 75
                              ? '#4ade80'
                              : pct >= 50
                                ? '#c85b3a'
                                : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <button
            onClick={() => {
              clearStoredProgress();

              setResult(null);
              setCurrentIndex(0);
              setAnswers({});
              setTimeSpentByQuestion({});
              setElapsedSeconds(0);
              setQuestionStartedAt(Date.now());
              setHydratedFromStorage(false);

              setAcknowledgedExamWarning(false);
              setHasConfirmedExamStart(false);
            }}
            className="btn-industrial w-full py-3 text-[11px] mt-10"
          >
            RETAKE EXAM â†’
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const selected = answers[question.id] ?? null;

  const recordTimeForCurrentQuestion = () => {
    const spent = Date.now() - questionStartedAt;

    setTimeSpentByQuestion((previous) => ({
      ...previous,
      [question.id]: (previous[question.id] ?? 0) + spent,
    }));
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= total) return;

    recordTimeForCurrentQuestion();
    setCurrentIndex(index);
    setQuestionStartedAt(Date.now());
  };

  const handleSelect = (optionIndex: number) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    recordTimeForCurrentQuestion();
    setIsSubmitting(true);
    setSubmitError(null);

    const finalTimes = {
      ...timeSpentByQuestion,
      [question.id]:
        (timeSpentByQuestion[question.id] ?? 0) +
        (Date.now() - questionStartedAt),
    };

    const payload = {
      answers: questions
        .filter((q) => answers[q.id] !== undefined)
        .map((q) => ({
          id: q.id,
          selected: answers[q.id],
          timeSpentMs: finalTimes[q.id] ?? 0,
        })),
    };

    if (payload.answers.length === 0) {
      setSubmitError(
        'Answer at least one question before submitting.',
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setSubmitError(
          'Your session expired. Please sign in again.',
        );
        return;
      }

      if (res.status === 403) {
        setSubmitError(
          'Access denied. Your purchase may have expired.',
        );
        return;
      }

      if (!res.ok) {
        setSubmitError(
          'We couldnâ€™t save your results. Please try again.',
        );
        return;
      }

      const data = (await res.json()) as ExamSubmitResult;

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      clearStoredProgress();
      setResult(data);
    } catch {
      setSubmitError(
        'Network error while submitting. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 px-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/account"
            className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] transition-colors"
          >
            BACK TO ACCOUNT
          </Link>

          <span className="meta text-[10px] text-[#4a453f]">
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        <div className="mb-6">
          <span className="meta text-[#c85b3a] text-sm">
            EXAM SIMULATOR
          </span>

          <div className="flex items-center justify-between mt-3">
            <span className="meta text-[10px] text-[#4a453f]">
              QUESTION {currentIndex + 1} OF {total}
            </span>

            <span className="meta text-[9px] text-[#4a453f]">
              {question.domain}
            </span>
          </div>

          <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#c85b3a] rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / total) * 100}%`,
              }}
            />
          </div>

          <p className="meta text-[9px] text-[#4a453f] mt-2">
            {answeredCount} of {total} answered
          </p>
        </div>

        <div className="depth-border corner-arch p-8">
          <h2 className="display-serif text-lg font-semibold text-white mb-6 leading-relaxed">
            {question.question}
          </h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={`w-full text-left px-5 py-4 border rounded transition-colors text-sm text-[#c2bab0] hover:border-[#c85b3a]/30 ${
                  selected === index
                    ? 'border-[#c85b3a]/50 bg-[#c85b3a]/[0.08]'
                    : 'border-white/[0.06] bg-transparent'
                }`}
              >
                <span className="text-[#4a453f] mr-3 meta text-[10px]">
                  {String.fromCharCode(65 + index)}
                </span>

                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="btn-industrial-outline px-6 py-3 text-[10px] disabled:opacity-40"
            >
              PREVIOUS
            </button>

            {currentIndex < total - 1 ? (
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="btn-industrial px-6 py-3 text-[10px]"
              >
                NEXT â†’
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-industrial px-6 py-3 text-[10px] disabled:opacity-50"
              >
                {isSubmitting
                  ? 'SUBMITTINGâ€¦'
                  : 'SUBMIT EXAM â†’'}
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <p className="text-[#c85b3a] text-sm mt-4 text-center">
            {submitError}
          </p>
        )}

        {currentIndex === total - 1 && !submitError && (
          <p className="text-center text-[#4a453f] mt-4 text-[10px] meta">
            {answeredCount < total
              ? `${total - answeredCount} question${
                  total - answeredCount === 1 ? '' : 's'
                } unanswered â€” only answered questions count toward your score.`
              : 'All questions answered.'}
          </p>
        )}
      </div>
    </div>
  );
}

function ExamReadinessDialog({
  acknowledged,
  onAcknowledgedChange,
  onStart,
}: {
  acknowledged: boolean;
  onAcknowledgedChange: (value: boolean) => void;
  onStart: () => void;
}) {
  return (
    <div className="min-h-screen pt-28 px-6 pb-24">
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-warning-title"
      >
        <div className="depth-border corner-arch w-full max-w-lg bg-[#151311] p-8 shadow-2xl">
          <p className="meta text-[10px] text-[#c85b3a] mb-3">
            EXAM READINESS CHECK
          </p>

          <h1
            id="exam-warning-title"
            className="display-serif text-2xl sm:text-3xl text-white font-semibold mb-5"
          >
            Before you begin
          </h1>

          <div className="body-readable text-[#c2bab0] text-sm leading-7 space-y-4">
            <p>
              This exam includes{' '}
              <strong className="text-white">
                3 total attempts
              </strong>{' '}
              available over a{' '}
              <strong className="text-white">
                30-day period
              </strong>
              .
            </p>

            <p>
              Each attempt is timed and includes{' '}
              <strong className="text-white">
                110 questions selected from a 155-question bank
              </strong>
              . Your questions will be different each time.
            </p>

            <p className="text-[#e0d8ce]">
              Starting the exam uses one of your attempts, even if
              you leave before finishing. Continue only when you are
              fully ready.
            </p>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-[#c2bab0]">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) =>
                onAcknowledgedChange(event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#c85b3a]"
            />

            <span>
              I understand that starting this exam uses one of my
              3 attempts.
            </span>
          </label>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/account"
              className="btn-industrial-outline px-6 py-3 text-center text-[10px]"
            >
              GO BACK
            </Link>

            <button
              type="button"
              disabled={!acknowledged}
              onClick={onStart}
              className="btn-industrial px-6 py-3 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              I&apos;M READY â€” START EXAM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Centered({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-32 px-6 pb-24">
      <div className="max-w-2xl mx-auto text-center">
        {children}
      </div>
    </div>
  );
}
