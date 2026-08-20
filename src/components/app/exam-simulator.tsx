"use client";

import { useState } from "react";
import type { DemoQuestion } from "@/lib/demo/exam-data";

interface ExamSimulatorProps {
  questions: DemoQuestion[];
}

export function ExamSimulator({ questions }: ExamSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = questions[currentIndex];
  const isAnswered = selected !== null;
  const isCorrect = selected === question?.correctAnswer;
  const total = questions.length;

  const handleSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelected(optionIndex);
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;
    const percentage = Math.round((correctCount / total) * 100);

    // Group by domain
    const byDomain: Record<string, { correct: number; total: number }> = {};
    for (const q of questions) {
      byDomain[q.domain] ??= { correct: 0, total: 0 };
      byDomain[q.domain].total += 1;
      if (answers[q.id] === q.correctAnswer) {
        byDomain[q.domain].correct += 1;
      }
    }

    return (
      <div className="depth-border corner-arch p-8">
        <div className="text-center mb-8">
          <p className="meta text-[10px] text-[#c85b3a] mb-2">DEMO RESULTS</p>
          <h2 className="display-serif text-3xl font-bold text-white mb-2">
            {correctCount}/{total} correct ({percentage}%)
          </h2>
          <p className="body-readable text-[#8a8279] text-sm">
            {percentage >= 75
              ? "Strong foundation — the full simulator will show you exactly where to sharpen."
              : "The full exam covers all 6 ARDMS domains with 110 questions. Targeted prep makes the difference."}
          </p>
        </div>

        {/* Per-domain breakdown */}
        <div className="space-y-3 mb-8">
          <p className="meta text-[9px] text-[#4a453f]">PER-DOMAIN BREAKDOWN</p>
          {Object.entries(byDomain).map(([domain, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
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
                      backgroundColor: pct >= 75 ? "#4ade80" : pct >= 50 ? "#c85b3a" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setCurrentIndex(0);
            setSelected(null);
            setAnswers({});
            setShowResults(false);
            setShowExplanation(false);
          }}
          className="btn-industrial w-full py-3 text-[11px]"
        >
          RETAKE DEMO →
        </button>
      </div>
    );
  }

  return (
    <div className="depth-border corner-arch p-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="meta text-[10px] text-[#4a453f]">
          QUESTION {currentIndex + 1} OF {total}
        </span>
        <span className="meta text-[9px] text-[#4a453f]">{question.domain}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#c85b3a] rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h3 className="display-serif text-lg font-semibold text-white mb-6 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => {
          let borderColor = "border-white/[0.06]";
          let bg = "bg-transparent";
          if (isAnswered) {
            if (i === question.correctAnswer) {
              borderColor = "border-green-500/50";
              bg = "bg-green-500/[0.08]";
            } else if (i === selected && !isCorrect) {
              borderColor = "border-red-500/50";
              bg = "bg-red-500/[0.08]";
            }
          } else if (i === selected) {
            borderColor = "border-[#c85b3a]/50";
            bg = "bg-[#c85b3a]/[0.08]";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full text-left px-5 py-4 border ${borderColor} ${bg} rounded transition-colors text-sm text-[#c2bab0] hover:border-[#c85b3a]/30 disabled:cursor-default`}
            >
              <span className="text-[#4a453f] mr-3 meta text-[10px]">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation toggle */}
      {isAnswered && (
        <div className="mb-6">
          {!showExplanation ? (
            <button
              onClick={() => setShowExplanation(true)}
              className="meta text-[10px] text-[#c85b3a] hover:text-[#e06840] transition-colors"
            >
              SHOW EXPLANATION →
            </button>
          ) : (
            <div className="border border-white/[0.06] bg-white/[0.02] p-5 rounded">
              <p className="meta text-[9px] text-[#4a453f] mb-2">EXPLANATION</p>
              <p className="body-small text-[#c2bab0] text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Next */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="btn-industrial w-full py-3 text-[11px]"
        >
          {currentIndex < total - 1 ? "NEXT QUESTION →" : "SEE RESULTS →"}
        </button>
      )}
    </div>
  );
}
