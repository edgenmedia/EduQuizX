"use client";

import { Timer, Calculator, Maximize2, Minimize2, Cloud, CloudOff, ShieldAlert, Sparkles, LogOut } from "lucide-react";

interface ExamHeaderHUDProps {
  examName: string;
  candidateName: string;
  timeRemainingSeconds: number;
  syncStatus: "Synced" | "Saving..." | "Unsynced (Local)" | string;
  isCalculatorOpen: boolean;
  onToggleCalculator: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isSimulation?: boolean;
  onExitSimulation?: () => void;
  tabSwitchCount?: number;
  proctorEventCount?: number;
}

export default function ExamHeaderHUD({
  examName,
  candidateName,
  timeRemainingSeconds,
  syncStatus,
  isCalculatorOpen,
  onToggleCalculator,
  isFullscreen,
  onToggleFullscreen,
  isSimulation = false,
  onExitSimulation,
  tabSwitchCount = 0,
  proctorEventCount = 0,
}: ExamHeaderHUDProps) {
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeRemainingSeconds <= 300; // <= 5 min
  const isCriticalTime = timeRemainingSeconds <= 120; // <= 2 min

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Teacher Simulation Top Banner */}
      {isSimulation && (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Teacher Sandbox Simulation Mode • Results will not affect real student analytics</span>
          </div>
          {onExitSimulation && (
            <button
              onClick={onExitSimulation}
              className="px-2.5 py-0.5 rounded bg-amber-650 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
            >
              <LogOut className="h-3 w-3" />
              <span>Exit Simulator</span>
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Exam Info & Candidate */}
        <div className="min-w-0 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-extrabold text-base shrink-0 border border-blue-500/20">
            EQ
          </div>
          <div className="truncate">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
              {examName}
            </h1>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              Candidate: <span className="font-bold text-slate-900 dark:text-white">{candidateName}</span>
            </p>
          </div>
        </div>

        {/* Center: High Visibility Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 font-mono font-bold text-sm sm:text-base transition-all ${
              isCriticalTime
                ? "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-450 animate-pulse shadow-rose-500/20 shadow-md"
                : isLowTime
                ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-450 shadow-xs"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            }`}
          >
            <Timer className={`h-4 w-4 ${isCriticalTime ? "text-rose-600 animate-spin" : isLowTime ? "text-amber-600" : "text-blue-650"}`} />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>
        </div>

        {/* Right: Tools & Status Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cloud Sync Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {syncStatus === "Synced" ? (
              <>
                <Cloud className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Synced</span>
              </>
            ) : syncStatus === "Saving..." ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-bold text-amber-650">Local Buffer</span>
              </>
            )}
          </div>

          {/* Proctoring Warning Badge if Tab Switches Detected */}
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-[11px] font-bold border border-rose-300 dark:border-rose-800" title={`${tabSwitchCount}/3 tab switches recorded`}>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span>{tabSwitchCount}/3 Strikes</span>
            </div>
          )}

          {/* Calculator Toggle */}
          <button
            type="button"
            onClick={onToggleCalculator}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCalculatorOpen
                ? "bg-blue-650 text-white border-blue-650"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Toggle Scientific Calculator"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Calculator</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
