"use client";

import { useState } from "react";
import { CheckCircle2, Flag, Circle, Filter } from "lucide-react";

interface QuestionPaletteProps {
  questions: any[];
  currentIndex: number;
  answers: Record<string, any>;
  flagged: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
}

export default function QuestionPalette({
  questions,
  currentIndex,
  answers,
  flagged,
  onSelectQuestion,
}: QuestionPaletteProps) {
  const [filter, setFilter] = useState<"ALL" | "ANSWERED" | "UNANSWERED" | "FLAGGED">("ALL");

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== null && String(a).trim() !== "";
  }).length;

  const flaggedCount = questions.filter((q) => flagged[q.id]).length;
  const unansweredCount = questions.length - answeredCount;

  const filteredQuestions = questions.map((q, idx) => ({ ...q, originalIndex: idx })).filter((q) => {
    const isAns = answers[q.id] !== undefined && answers[q.id] !== null && String(answers[q.id]).trim() !== "";
    const isFlg = flagged[q.id];

    if (filter === "ANSWERED") return isAns;
    if (filter === "UNANSWERED") return !isAns;
    if (filter === "FLAGGED") return isFlg;
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
      {/* Header & Metric Chips */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
          Question Palette
        </h3>
        <span className="text-xs font-bold text-slate-500">
          {answeredCount} / {questions.length} Solved
        </span>
      </div>

      {/* Status Legend & Summary */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/5 border border-emerald-250 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-350">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-bold uppercase tracking-wide truncate">{answeredCount} Ans</span>
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-purple-500/5 border border-purple-250 dark:border-purple-900/40 text-purple-800 dark:text-purple-300">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
          <span className="font-bold uppercase tracking-wide truncate">{flaggedCount} Rev</span>
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
          <span className="font-bold uppercase tracking-wide truncate">{unansweredCount} Left</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
        {[
          { id: "ALL", label: `All (${questions.length})` },
          { id: "ANSWERED", label: `Answered (${answeredCount})` },
          { id: "FLAGGED", label: `Review (${flaggedCount})` },
          { id: "UNANSWERED", label: `Unsolved (${unansweredCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              filter === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Question Number Pills Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto pr-1">
        {filteredQuestions.map((q) => {
          const idx = q.originalIndex;
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && String(answers[q.id]).trim() !== "";
          const isFlagged = flagged[q.id];

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`relative h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${
                isCurrent
                  ? "ring-2 ring-blue-600 border-blue-600 scale-105 z-10"
                  : "hover:scale-102"
              } ${
                isFlagged
                  ? "bg-purple-500/10 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300"
                  : isAnswered
                  ? "bg-emerald-55/15 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
              }`}
              title={`Question ${idx + 1}: ${isAnswered ? "Answered" : "Unanswered"}${isFlagged ? " (Marked for review)" : ""}`}
            >
              <span>{idx + 1}</span>
              {isFlagged && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-650" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
