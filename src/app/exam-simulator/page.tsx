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

export default function ExamSimulatorPage() {
  const { state, refetch } = useProtectedContent<ExamContentResponse>('EXAM_SIMULATOR');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [timeSpentByQuestion, setTimeSpentByQuestion] = useState<Record<number, number>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ExamSubmitResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Whole-exam elapsed-time stopwatch. Started once questions are loaded,
  // cleared on unmount (leaving the page / refreshing) and again once the
  // exam is submitted, so it never keeps ticking in the background.
  useEffect(() => {
    if (state.status !== 'success' || result) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, result]);

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">Loading Exam Simulator…</p>
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
        <Link href="/login" className="btn-industrial px-6 py-3 text-[10px]">
          SIGN IN →
        </Link>
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
          You don&apos;t have an active Exam Simulator purchase. Grab it (or the
          Premium Bundle) to unlock this content.
        </p>
        <Link href="/products" className="btn-industrial px-6 py-3 text-[10px]">
          BROWSE PRODUCTS →
        </Link>
      </Centered>
    );
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <p className="text-[#c85b3a] text-sm mb-6">{state.message}</p>
        <button onClick={refetch} className="btn-industrial px-6 py-3 text-[10px]">
          RELOAD →
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

  // ── Results screen (after a successful submission) ──────────────────
  if (result) {
    return (
      <div className="min-h-screen pt-28 px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/account"
            className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 inline-block transition-colors"
          >
            ← BACK TO ACCOUNT
          </Link>

          <div className="text-center mb-10">
            <p className="meta text-[10px] text-[#c85b3a] mb-2">RESULTS</p>
            <h1 className="display-serif text-3xl sm:text-4xl text-white font-semibold mb-2">
              {result.correct}/{result.total} correct ({result.score}%)
            </h1>
            <p className="body-readable text-[#8a8279] text-sm">
              Saved to your account. Domain breakdown below.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(result.perDomain).map(([domain, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              return (
                <div key={domain}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#c2bab0]">{domain}</span>
                    <span className="text-[#8a8279]">
                      {stats.correct}/{stats.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 75 ? '#4ade80' : pct >= 50 ? '#c85b3a' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setResult(null);
              setCurrentIndex(0);
              setAnswers({});
              setTimeSpentByQuestion({});
              setElapsedSeconds(0);
              setQuestionStartedAt(Date.now());
              refetch();
            }}
            className="btn-industrial w-full py-3 text-[11px] mt-10"
          >
            RETAKE EXAM →
          </button>
        </div>
      </div>
    );
  }

  // ── In-progress exam ─────────────────────────────────────────────────
  const question = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const selected = answers[question.id] ?? null;

  const recordTimeForCurrentQuestion = () => {
    const spent = Date.now() - questionStartedAt;
    setTimeSpentByQuestion((prev) => ({
      ...prev,
      [question.id]: (prev[question.id] ?? 0) + spent,
    }));
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= total) return;
    recordTimeForCurrentQuestion();
    setCurrentIndex(index);
    setQuestionStartedAt(Date.now());
  };

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // prevent duplicate submissions
    recordTimeForCurrentQuestion();
    setIsSubmitting(true);
    setSubmitError(null);

    const finalTimes = { ...timeSpentByQuestion, [question.id]: (timeSpentByQuestion[question.id] ?? 0) + (Date.now() - questionStartedAt) };

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
      setSubmitError('Answer at least one question before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setSubmitError('Your session expired. Please sign in again.');
        return;
      }
      if (res.status === 403) {
        setSubmitError('Access denied. Your purchase may have expired.');
        return;
      }
      if (!res.ok) {
        setSubmitError('We couldn\u2019t save your results. Please try again.');
        return;
      }

      const data = (await res.json()) as ExamSubmitResult;
      if (timerRef.current) clearInterval(timerRef.current);
      setResult(data);
    } catch {
      setSubmitError('Network error while submitting. Please try again.');
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
            ← BACK TO ACCOUNT
          </Link>
          <span className="meta text-[10px] text-[#4a453f]">{formatElapsed(elapsedSeconds)}</span>
        </div>

        <div className="mb-6">
          <span className="meta text-[#c85b3a] text-sm">EXAM SIMULATOR</span>
          <div className="flex items-center justify-between mt-3">
            <span className="meta text-[10px] text-[#4a453f]">
              QUESTION {currentIndex + 1} OF {total}
            </span>
            <span className="meta text-[9px] text-[#4a453f]">{question.domain}</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#c85b3a] rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
          <p className="meta text-[9px] text-[#4a453f] mt-2">{answeredCount} of {total} answered</p>
        </div>

        <div className="depth-border corner-arch p-8">
          <h2 className="display-serif text-lg font-semibold text-white mb-6 leading-relaxed">
            {question.question}
          </h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-5 py-4 border rounded transition-colors text-sm text-[#c2bab0] hover:border-[#c85b3a]/30 ${
                  selected === i
                    ? 'border-[#c85b3a]/50 bg-[#c85b3a]/[0.08]'
                    : 'border-white/[0.06] bg-transparent'
                }`}
              >
                <span className="text-[#4a453f] mr-3 meta text-[10px]">
                  {String.fromCharCode(65 + i)}
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
              ← PREVIOUS
            </button>

            {currentIndex < total - 1 ? (
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="btn-industrial px-6 py-3 text-[10px]"
              >
                NEXT →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-industrial px-6 py-3 text-[10px] disabled:opacity-50"
              >
                {isSubmitting ? 'SUBMITTING…' : 'SUBMIT EXAM →'}
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <p className="text-[#c85b3a] text-sm mt-4 text-center">{submitError}</p>
        )}

        {currentIndex === total - 1 && !submitError && (
          <p className="text-center text-[#4a453f] mt-4 text-[10px] meta">
            {answeredCount < total
              ? `${total - answeredCount} question${total - answeredCount === 1 ? '' : 's'} unanswered — only answered questions count toward your score.`
              : 'All questions answered.'}
          </p>
        )}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-32 px-6 pb-24">
      <div className="max-w-2xl mx-auto text-center">{children}</div>
    </div>
  );
}
