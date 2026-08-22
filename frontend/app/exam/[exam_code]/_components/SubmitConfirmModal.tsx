"use client";

import { AlertCircle, CheckCircle2, Flag, FileQuestion, ArrowRight, X } from "lucide-react";

interface SubmitConfirmModalProps {
  questions: any[];
  answers: Record<string, any>;
  flagged: Record<string, boolean>;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function SubmitConfirmModal({
  questions,
  answers,
  flagged,
  onConfirm,
  onCancel,
  loading,
}: SubmitConfirmModalProps) {
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== null && String(a).trim() !== "";
  }).length;

  const flaggedCount = questions.filter((q) => flagged[q.id]).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Confirm Exam Submission
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Are you sure you want to finish and submit your responses? Once submitted, your answers will be locked and graded.
        </p>

        {/* Breakdown Card */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-200 dark:border-emerald-900/40">
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-300">
              {answeredCount}
            </div>
            <div className="text-[9px] font-bold text-emerald-800 dark:text-emerald-450 mt-0.5 uppercase tracking-wider">
              Answered
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-200 dark:border-purple-900/40">
            <div className="text-lg font-extrabold text-purple-600 dark:text-purple-300">
              {flaggedCount}
            </div>
            <div className="text-[9px] font-bold text-purple-800 dark:text-purple-450 mt-0.5 uppercase tracking-wider">
              In Review
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-200 dark:border-rose-900/40">
            <div className="text-lg font-extrabold text-rose-650">
              {unansweredCount}
            </div>
            <div className="text-[9px] font-bold text-rose-800 dark:text-rose-450 mt-0.5 uppercase tracking-wider">
              Unanswered
            </div>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-slate-700 dark:text-slate-350 text-xs flex items-start gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              You still have <b>{unansweredCount} unanswered questions</b>. You may return to the test to answer them before submitting.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Return to Test
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Final Exam</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
