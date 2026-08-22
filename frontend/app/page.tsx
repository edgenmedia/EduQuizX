"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { 
  School, 
  FileEdit, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  ShieldAlert, 
  BarChart3, 
  KeyRound, 
  Sun, 
  Moon, 
  LogOut, 
  Copy, 
  Check, 
  FileCode2, 
  Award,
  Zap
} from "lucide-react";

export default function UnifiedHomePage() {
  const router = useRouter();
  const { token, fullName, role, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [directExamCode, setDirectExamCode] = useState("");
  const [copiedCred, setCopiedCred] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<"creator" | "student" | "proctor" | "analytics">("creator");

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const isTeacher = role === "teacher" || role === "inst_admin" || role === "super_admin";

  const handleTeacherModeSelect = () => {
    if (token) {
      router.push("/dashboard/teacher");
    } else {
      router.push("/login?role=teacher&target=teacher_dashboard");
    }
  };

  const handleStudentModeSelect = () => {
    if (token) {
      router.push("/dashboard/student");
    } else {
      router.push("/login?role=student&target=student_dashboard");
    }
  };

  const handleDirectExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directExamCode.trim()) return;
    const cleanCode = directExamCode.trim().replace(/^.*\/exam\//, "");
    router.push(`/exam/${cleanCode}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCred(label);
    setTimeout(() => setCopiedCred(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-350 selection:bg-blue-500/20 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Decorative Blob elements for premium aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/10 dark:bg-violet-500/5 blur-[150px] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0b0f19]/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">EduQuizX</span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
              Autonomous AI Examination & Live Proctoring Platform
            </p>
          </div>
        </div>

        {/* Action Controls & User Auth Bar */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Quick Anchor Links */}
          <button
            onClick={() => scrollToSection("mode-selection")}
            className="hidden lg:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Select Mode
          </button>
          <button
            onClick={() => scrollToSection("platform-guide")}
            className="hidden lg:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            User Guide
          </button>
          <button
            onClick={() => scrollToSection("demo-credentials")}
            className="hidden lg:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Demo Accounts
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-12 h-7 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 flex items-center cursor-pointer transition-colors duration-300 relative focus:outline-none"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            aria-label="Toggle Theme"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white dark:bg-blue-600 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                theme === "dark" ? "translate-x-5 text-white" : "translate-x-0 text-amber-505"
              }`}
            >
              {theme === "light" ? <Sun className="h-3.5 w-3.5" style={{ color: '#d97706' }} /> : <Moon className="h-3.5 w-3.5" />}
            </div>
          </button>

          {/* User Auth Status or Login CTAs */}
          {mounted && token ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{fullName || "User"}</span>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/15 px-1.5 py-0.5 rounded">
                  {role}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="p-2 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-xs cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/login?mode=signup")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* HERO & MODE SELECTION HUB */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 sm:py-16 space-y-14 w-full z-10 relative">
        
        {/* Hero Title */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Select Your Portal to Begin</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Next-Gen Autonomous <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
              Assessment & Proctoring
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            Create multi-modal vector assessments as an instructor, or log in to the candidate sandbox to attempt examinations under secure active monitoring.
          </p>
        </section>

        {/* THE 2 CORE WORKSPACE MODE CARDS */}
        <section id="mode-selection" className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* CARD 1: CREATE TEST (TEACHER STUDIO) */}
          <div
            onClick={handleTeacherModeSelect}
            className="group relative bg-white dark:bg-[#131b2e] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <FileEdit className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  Instructor Studio
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Create Test
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                  Design syllabus blueprints, upload course files to RAG vector knowledge base, monitor anti-cheat telemetry, and export graded analytics.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800 pt-6">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>AI Question Generator from Subject KB</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Multi-modal Knowledge Base (PDF, DOCX, PPTX)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Live Proctoring Radar & Telemetry logs</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Interactive Question Studio with LaTeX support</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button 
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3.5 text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>{token && isTeacher ? "Open Teacher Studio" : "Proceed to Create Test"}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* CARD 2: TAKE TEST (STUDENT PORTAL) */}
          <div
            onClick={handleStudentModeSelect}
            className="group relative bg-white dark:bg-[#131b2e] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                  Candidate Portal
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Take Test
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                  Student workspace for attempting assigned assessments, entering timed passcode rooms, and downloading detailed AI response diagnostic reviews.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800 pt-6">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>1-Click Launch with Assigned Credentials</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Real-time Local & Cloud Progress Backup</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Anti-Cheat HUD with Tab-Switch Warning</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Printable Graded Response booklets</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button 
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3.5 text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>{token ? "Open Student Portal" : "Proceed to Take Test"}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </section>

        {/* FAST DIRECT EXAM CODE JUMP BAR */}
        <section className="max-w-5xl mx-auto">
          <div className="p-6 bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileCode2 className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Have a Direct Exam Code from Your Instructor?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste your test code below to jump directly into the candidate testing gateway.
                </p>
              </div>
            </div>

            <form onSubmit={handleDirectExamSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={directExamCode}
                onChange={(e) => setDirectExamCode(e.target.value)}
                placeholder="e.g. ex-compi-6356"
                className="w-full md:w-60 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all shrink-0 cursor-pointer shadow-sm"
              >
                Join Room
              </button>
            </form>
          </div>
        </section>

        {/* INTEGRATED PLATFORM ARCHITECTURE & USER GUIDE */}
        <section id="platform-guide" className="max-w-5xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Platform Capabilities & System Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Explore how EduQuizX orchestrates AI question synthesis, multi-format knowledge indexing, and live telemetry proctoring.
            </p>
          </div>

          {/* Guide Tab Switcher */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveGuideTab("creator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeGuideTab === "creator"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>1. Teacher Creator Studio</span>
            </button>

            <button
              onClick={() => setActiveGuideTab("student")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeGuideTab === "student"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>2. Student Test Runner</span>
            </button>

            <button
              onClick={() => setActiveGuideTab("proctor")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeGuideTab === "proctor"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>3. Anti-Cheat Telemetry</span>
            </button>

            <button
              onClick={() => setActiveGuideTab("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeGuideTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>4. Evaluation & Gradebook</span>
            </button>
          </div>

          {/* Guide Content Display Card */}
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            {activeGuideTab === "creator" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                  <FileEdit className="h-5 w-5" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Instructor 4-Step Assessment Creator</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> Step 1: Knowledge Base
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Select existing document or upload new PDF/PPTX/TXT files directly for ChromaDB vector embedding.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" /> Step 2: AI Blueprint
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Configure MCQ / short answer distributions, difficulty levels, and syllabus coverage targets.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <FileCode2 className="h-3.5 w-3.5" /> Step 3: Question Editor
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Review AI generated questions with LaTeX math rendering, live editing, and custom question additions.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> Step 4: Scheduling
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Assign test windows, fullscreen enforcement rules, calculators, and generate candidate passcodes.</p>
                  </div>
                </div>
              </div>
            )}

            {activeGuideTab === "student" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="h-5 w-5" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Candidate Testing & Response Sync</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">1-Click Fast Gateway</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Authenticated students launch assessments with 1-click without entering passwords, or use 6-digit access PINs.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">Dual Sync Engine</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Every response is backed up in LocalStorage and synchronized to the SQLite/PostgreSQL cloud store on keystroke.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">Built-in Scientific Tools</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Includes floating scientific calculator, formula rendering, flag for review, and keyboard shortcuts.</p>
                  </div>
                </div>
              </div>
            )}

            {activeGuideTab === "proctor" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Live Anti-Cheat & Proctoring Radar</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-rose-600 dark:text-rose-400">Tab-Switch Interception</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Automated 3-strike tab switch enforcement with progressive warning toasts and automatic test submission on violation #3.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-rose-600 dark:text-rose-400">Live WebSocket Telemetry</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Real-time websocket telemetry stream push alerts directly to the instructor's live proctoring grid.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-rose-600 dark:text-rose-400">Clipboard & Window Lockdown</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Copy-paste interception, fullscreen enforcement, and right-click blocking maintain examination integrity.</p>
                  </div>
                </div>
              </div>
            )}

            {activeGuideTab === "analytics" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                  <BarChart3 className="h-5 w-5" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Instant Grading & Response Booklets</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">Instant AI Grading</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Objective questions graded immediately; subjective answers evaluated by Gemini with constructive feedback.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">Topic-by-Topic Breakdown</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Detailed charts break down candidate strengths, weak topics, cohort percentile ranks, and passing trends.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">Export & PDF Generation</div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">1-click PDF booklet downloads, official cohort gradebook spreadsheets, and audit logs.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* DEMO CREDENTIALS SECTION */}
        <section id="demo-credentials" className="max-w-5xl mx-auto space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <KeyRound className="h-4 w-4 text-blue-600" />
              <span>Instant Demo Accounts</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Click to copy credentials</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teacher Demo Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 flex items-center justify-center">
                    <FileEdit className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Instructor / Teacher Demo</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Full creator & proctor privileges</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard("kb_test_teacher@aegeus.edu\nSecurePassword123!", "teacher")}
                  className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedCred === "teacher" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCred === "teacher" ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">Email:</span> <b className="text-slate-900 dark:text-white">kb_test_teacher@aegeus.edu</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Pass:</span> <b className="text-blue-600 dark:text-blue-400">SecurePassword123!</b></div>
              </div>
            </div>

            {/* Student Demo Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Student / Candidate Demo</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Enrolled candidate test portal</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard("alex.student@aegeus.edu\nSecurePassword123!", "student")}
                  className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedCred === "student" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCred === "student" ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-805 space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">Email:</span> <b className="text-slate-900 dark:text-white">alex.student@aegeus.edu</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Pass:</span> <b className="text-emerald-600 dark:text-emerald-400">SecurePassword123!</b></div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] px-4 md:px-8 py-6 mt-12 transition-all">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
            <span>EduQuizX Autonomous AI Assessment System • AES-256 Secure Cloud</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/guide" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Platform Manual</a>
            <span>•</span>
            <a href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login Gateway</a>
            <span>•</span>
            <a href="/dashboard/teacher" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Teacher Studio</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
