"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch, API_V1 } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { 
  Award, Calendar, FileText, CheckCircle, TrendingUp, BookOpen, Download,
  Trophy, Target, BarChart3, XCircle, ChevronDown, ChevronUp, Medal,
  RefreshCw, CheckCircle2, AlertCircle, Clock, Sparkles, User, ArrowRight,
  BookMarked, HelpCircle, ShieldCheck, GraduationCap, Play, Key, Lock, Check,
  Timer, ChevronRight, ExternalLink, FileCode2
} from "lucide-react";
import MathText from "../../../components/MathText";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const { token, fullName, role } = useAuthStore();
  
  // Data States
  const [assignedExams, setAssignedExams] = useState<any[]>([]);
  const [directCodeInput, setDirectCodeInput] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedSubDetail, setSelectedSubDetail] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // UI States
  const [activePortalTab, setActivePortalTab] = useState<"assigned" | "submissions" | "progress">("assigned");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<"questions" | "topics" | "leaderboard">("questions");
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>("");
  const [progressData, setProgressData] = useState<any | null>(null);

  const fetchProgressData = async () => {
    try {
      const res = await apiFetch("/reports/my-progress", { token });
      if (res.ok) {
        setProgressData(await res.json());
      }
    } catch {}
  };

  const isTeacher = role === "teacher" || role === "inst_admin" || role === "super_admin";

  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      // 1. If teacher previewing, fetch student directory
      if (isTeacher) {
        try {
          const sRes = await apiFetch("/students/", { token });
          const sData = await sRes.json();
          if (sRes.ok && Array.isArray(sData)) {
            setStudentsList(sData);
          }
        } catch {}
      }

      // 2. Fetch Assigned / Active Exams
      try {
        const aRes = await apiFetch("/students/assigned-exams", { token });
        const aData = await aRes.json();
        if (aRes.ok && Array.isArray(aData)) {
          setAssignedExams(aData);
        }
      } catch {}

      // 3. Fetch Submissions
      const url = selectedStudentFilter ? `/reports/my-submissions?student_id=${selectedStudentFilter}` : "/reports/my-submissions";
      const res = await apiFetch(url, { token });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setSubmissions(data);
        if (data.length > 0) {
          const firstId = selectedSubId || data[0].id;
          setSelectedSubId(firstId);
          loadSubDetail(firstId);
        } else {
          setSelectedSubId(null);
          setSelectedSubDetail(null);
        }
      }

      // 4. Fetch Student Progress Analytics
      fetchProgressData();
    } catch {
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, selectedStudentFilter]);

  const loadSubDetail = async (subId: string) => {
    setSelectedSubId(subId);
    setLoadingDetail(true);
    try {
      const res = await apiFetch(`/reports/submission-detail/${subId}`, { token });
      const data = await res.json();
      if (res.ok) {
        setSelectedSubDetail(data);
        if (data.exam_id) {
          const lbRes = await apiFetch(`/reports/leaderboard/${data.exam_id}`, { token });
          const lbData = await lbRes.json();
          if (lbRes.ok && Array.isArray(lbData)) {
            setLeaderboard(lbData);
          }
        }
      }
    } catch {
    } finally {
      setSelectedSubId(subId);
      setLoadingDetail(false);
    }
  };

  // Overall KPIs
  const stats = useMemo(() => {
    if (submissions.length === 0) return { best: 0, avg: 0, count: 0, passRate: 0 };
    const percs = submissions.map(s => Number(s.percentage) || 0);
    const best = Math.max(...percs);
    const avg = percs.reduce((a, b) => a + b, 0) / percs.length;
    const passed = submissions.filter(s => (s.percentage || 0) >= 50).length;
    return {
      best: Math.round(best),
      avg: Math.round(avg),
      count: submissions.length,
      passRate: Math.round((passed / submissions.length) * 100)
    };
  }, [submissions]);

  const liveExamsCount = useMemo(() => {
    return assignedExams.filter(e => e.status === "active" && !e.has_submitted).length;
  }, [assignedExams]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      
      {/* TOP HEADER & SUMMARY BANNER */}
      <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-450/15 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {fullName || (isTeacher ? "Instructor Portal" : "Student Candidate")}
                </h1>
                {isTeacher ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Teacher / Staff Preview</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-800/40 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified Student</span>
                  </span>
                )}
                {liveExamsCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600/10 text-blue-600 dark:bg-blue-450/15 dark:text-blue-400 border border-blue-600/30 animate-pulse">
                    {liveExamsCount} Live Test{liveExamsCount > 1 ? "s" : ""} Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {isTeacher 
                  ? "Instructor Preview: Inspect student assessments, passcodes & performance records."
                  : "Access active assessment rooms, view security credentials, and review grading analytics."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {isTeacher && studentsList.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-slate-405 font-bold uppercase text-[9px] tracking-wider">Filter Student:</span>
                <select
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-slate-850 dark:text-white"
                >
                  <option value="">All Students Submissions</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.roll_number})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Portal View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActivePortalTab("assigned")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activePortalTab === "assigned"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Assigned & Live Tests ({assignedExams.length})</span>
          </button>

          <button
            onClick={() => setActivePortalTab("submissions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activePortalTab === "submissions"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Past Submissions & Analytics ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActivePortalTab("progress")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activePortalTab === "progress"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Learning Trends & Mastery</span>
          </button>
        </div>

        {/* Overall KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Assessments</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{stats.count}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Total finished attempts</div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cohort Grade Average</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1.5">{stats.avg}%</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Mean grading average</div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Highest Score</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1.5">{stats.best}%</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Highest recorded score</div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passing Rate</div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1.5">{stats.passRate}%</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Assessments cleared successfully</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: ASSIGNED & LIVE EXAMS VIEW */}
      {activePortalTab === "assigned" && (
        <div className="space-y-5">
          
          {/* Fast Direct Exam Jump Box */}
          <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 flex items-center justify-center">
                <FileCode2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-850 dark:text-slate-200">Have a Direct Assessment Code?</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Enter the test code to jump straight into the candidate assessment room</div>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!directCodeInput.trim()) return;
                const clean = directCodeInput.trim().replace(/^.*\/exam\//, "");
                router.push(isTeacher ? `/exam/${clean}?mode=teacher_preview` : `/exam/${clean}`);
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                value={directCodeInput}
                onChange={(e) => setDirectCodeInput(e.target.value)}
                placeholder="e.g. ex-com-1234"
                className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-48"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
              >
                Join Room
              </button>
            </form>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">
              Available & Scheduled Examinations
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              {assignedExams.length} Total Found
            </span>
          </div>

          {assignedExams.length === 0 ? (
            <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 text-slate-400 mx-auto opacity-50" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Active Assessments Available</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Your instructors have not published any new tests right now. When an assessment is published live, it will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedExams.map((exam) => {
                const isLive = exam.status === "active";
                const isEnded = exam.status === "ended";
                const hasCompleted = exam.has_submitted;

                return (
                  <div
                    key={exam.exam_id}
                    className="bg-white dark:bg-[#131b2e] border border-slate-202 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-400/40 transition-all hover:shadow-md"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-650 dark:text-blue-400">
                            Code: {exam.exam_code}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                            {exam.name}
                          </h3>
                        </div>

                        {hasCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                            Completed
                          </span>
                        ) : isLive ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-800/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Live Now</span>
                          </span>
                        ) : isEnded ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200">
                            Ended
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                            Scheduled
                          </span>
                        )}
                      </div>

                      {/* Exam Specs */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Duration</div>
                          <div className="font-bold text-slate-905 dark:text-white mt-0.5">{exam.duration_minutes} mins</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Questions</div>
                          <div className="font-bold text-slate-905 dark:text-white mt-0.5">{exam.questions_count} Qs</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-slate-400">Marks</div>
                          <div className="font-bold text-slate-905 dark:text-white mt-0.5">{exam.total_marks} Pts</div>
                        </div>
                      </div>

                      {/* Credentials Display Card if Assigned */}
                      {exam.credentials && !hasCompleted && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                            <Key className="h-3 w-3 text-blue-650" />
                            <span>Passcode Credentials</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-450">Username:</span>
                            <b className="text-slate-900 dark:text-white">{exam.credentials.username}</b>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-450">Passcode:</span>
                            <b className="text-blue-650 dark:text-blue-400">{exam.credentials.password}</b>
                          </div>
                        </div>
                      )}

                      {/* Completed Score Badge */}
                      {hasCompleted && exam.submission_score !== null && (
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                          <span className="text-emerald-800 dark:text-emerald-300 font-bold">Your Score:</span>
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-350">
                            {exam.submission_score} / {exam.total_marks} ({exam.submission_percentage}%)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-3">
                      {hasCompleted ? (
                        <button
                          onClick={() => {
                            setActivePortalTab("submissions");
                            if (exam.submission_id) loadSubDetail(exam.submission_id);
                          }}
                          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trophy className="h-3.5 w-3.5 text-blue-600" />
                          <span>View detailed evaluation</span>
                        </button>
                      ) : isLive ? (
                        <a
                          href={isTeacher ? `/exam/${exam.exam_code}?mode=teacher_preview` : `/exam/${exam.exam_code}`}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>{isTeacher ? "Launch Simulator Preview" : "Enter Exam Room"}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      ) : isEnded ? (
                        <div className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-center text-xs font-bold text-slate-500">
                          Assessment Window Closed
                        </div>
                      ) : (
                        <div className="w-full py-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-955/20 border border-amber-200 text-center text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Starts {new Date(exam.start_time).toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SUBMISSIONS & PERFORMANCE BREAKDOWN */}
      {activePortalTab === "submissions" && (
        submissions.length === 0 ? (
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto opacity-50" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Quiz Attempts Recorded</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              When you complete an assessment or exam, your quiz-by-quiz performance summary, grade breakdown, and learning recommendations will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: QUIZ-WISE ATTEMPTS LIST */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Attempts History ({submissions.length})
                </h2>
                <span className="text-[10px] text-slate-400">Select to inspect</span>
              </div>

              <div className="space-y-3">
                {submissions.map((sub) => {
                  const isSelected = sub.id === selectedSubId;
                  const isPassed = (sub.percentage || 0) >= 50;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => loadSubDetail(sub.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs space-y-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-blue-500/5 border-blue-500 shadow-sm dark:bg-blue-400/5 dark:border-blue-400"
                          : "bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                            {sub.exam_name || "Assessment"}
                          </div>
                          {sub.student_name && isTeacher && (
                            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{sub.student_name} {sub.roll_number ? `(${sub.roll_number})` : ""}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                            <Calendar className="h-3 w-3" />
                            <span>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "Recent"}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase shrink-0 ${
                          isPassed 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}>
                          {isPassed ? "PASSED" : "FAILED"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-450">Score:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {sub.score} / {sub.max_score}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`${API_V1}/reports/submission-detail/${sub.id}/printable`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-all"
                            title="Print response booklet"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </a>
                          <div className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                            {sub.percentage}%
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: DEDICATED QUIZ PERFORMANCE SUMMARY */}
            <div className="lg:col-span-8">
              {loadingDetail ? (
                <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">Loading Quiz Evaluation & Breakdown...</p>
                </div>
              ) : selectedSubDetail ? (
                <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Quiz Header & Score Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          Code: {selectedSubDetail.exam_code || "EXAM"}
                        </span>
                        
                        {/* Certificate Button */}
                        <a
                          href={`${API_V1}/reports/submissions/${selectedSubDetail.submission_id}/certificate-html`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                          title="Print / View Official Certificate"
                        >
                          <Trophy className="h-3 w-3 text-amber-600" />
                          <span>Certificate</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>

                        {/* Report Card Button */}
                        <a
                          href={`${API_V1}/reports/submissions/${selectedSubDetail.submission_id}/report-card-html`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase px-3 py-1 rounded-full bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                          title="Print Scorecard (PDF)"
                        >
                          <FileText className="h-3 w-3 text-blue-600" />
                          <span>Scorecard</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">
                        {selectedSubDetail.exam_name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                      <div>
                        <div className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Earned Score</div>
                        <div className="text-xl font-extrabold text-blue-600">
                          {selectedSubDetail.score} <span className="text-xs font-normal text-slate-400">/ {selectedSubDetail.max_score}</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                      <div>
                        <div className="text-[9px] text-slate-455 uppercase font-bold tracking-wider">Accuracy</div>
                        <div className="text-xl font-extrabold text-slate-905 dark:text-white">
                          {selectedSubDetail.percentage}%
                        </div>
                      </div>
                      {selectedSubDetail.rank && (
                        <>
                          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                          <div>
                            <div className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Class Rank</div>
                            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                              #{selectedSubDetail.rank}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Learning Critique & Roadmap */}
                  {selectedSubDetail.ai_feedback && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4.5 space-y-1.5 shadow-inner">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>AI Learning Diagnosis & Recommendations</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed pl-6">
                        {selectedSubDetail.ai_feedback}
                      </p>
                    </div>
                  )}

                  {/* Navigation Tabs (Questions / Topics / Leaderboard) */}
                  <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <button
                      onClick={() => setActiveViewTab("questions")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeViewTab === "questions"
                          ? "bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Questions Review</span>
                    </button>

                    <button
                      onClick={() => setActiveViewTab("topics")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeViewTab === "topics"
                          ? "bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Topic Mastery</span>
                    </button>

                    <button
                      onClick={() => setActiveViewTab("leaderboard")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeViewTab === "leaderboard"
                          ? "bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      <span>Leaderboard</span>
                    </button>
                  </div>

                  {/* TAB 1: QUESTION-BY-QUESTION REVIEW */}
                  {activeViewTab === "questions" && (
                    <div className="space-y-4">
                      {selectedSubDetail.questions && selectedSubDetail.questions.length > 0 ? (
                        selectedSubDetail.questions.map((q: any, idx: number) => {
                          const isCorrect = q.is_correct;
                          return (
                            <div
                              key={idx}
                              className={`p-4.5 rounded-2xl border transition-all text-xs space-y-3.5 ${
                                isCorrect
                                  ? "bg-emerald-500/5 border-emerald-200 dark:border-emerald-800/40"
                                  : "bg-rose-500/5 border-rose-200 dark:border-rose-800/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="font-extrabold text-slate-400 font-mono">Q{idx + 1}.</span>
                                  <div>
                                    <div className="font-semibold text-slate-900 dark:text-white text-xs leading-relaxed">
                                      <MathText text={q.question_text || q.question || ""} />
                                    </div>
                                    {q.topic && (
                                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                                        Topic: {q.topic}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold shrink-0 flex items-center gap-1 ${
                                  isCorrect 
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-350"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-350"
                                }`}>
                                  {isCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  <span>{q.score_awarded ?? (isCorrect ? q.marks : 0)} / {q.marks || 1} Marks</span>
                                </span>
                              </div>

                              {/* Options Breakdown with KaTeX */}
                              {q.options && typeof q.options === "object" && Object.keys(q.options).length > 0 && (
                                <div className="space-y-1.5 pl-6">
                                  {Object.entries(q.options).map(([optKey, optVal]: [string, any]) => {
                                    const isUserChoice = String(q.user_answer) === optKey;
                                    const isActualCorrect = String(q.correct_answer) === optKey;
                                    
                                    return (
                                      <div
                                        key={optKey}
                                        className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                                          isActualCorrect
                                            ? "bg-emerald-100/40 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold"
                                            : isUserChoice
                                            ? "bg-rose-100/40 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                                            : "bg-white/60 dark:bg-[#131b2e]/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold uppercase">{optKey}.</span>
                                          <span><MathText text={String(optVal)} /></span>
                                        </div>
                                        <div className="text-[9px] font-extrabold uppercase">
                                          {isActualCorrect && <span className="text-emerald-700 dark:text-emerald-300">✓ Correct</span>}
                                          {isUserChoice && !isActualCorrect && <span className="text-rose-700 dark:text-rose-300">✗ Your Choice</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Subjective / Written Response Display */}
                              {(!q.options || (typeof q.options === "object" && Object.keys(q.options).length === 0)) && (
                                <div className="space-y-2.5 pl-6">
                                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 space-y-1">
                                    <div className="text-[9px] font-bold uppercase text-slate-400">Your Written Response:</div>
                                    <div className="text-xs text-slate-850 dark:text-slate-200 whitespace-pre-wrap font-medium">
                                      <MathText text={String(q.user_answer_text || q.user_answer || "No response provided.")} />
                                    </div>
                                  </div>
                                  {q.ai_feedback && (
                                    <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 text-slate-700 dark:text-slate-300 text-xs">
                                      <b className="text-[9px] uppercase font-bold text-amber-600 block mb-1">AI Evaluator Feedback:</b>
                                      {q.ai_feedback}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Explanation / Critique with KaTeX */}
                              {q.explanation && (
                                <div className="pl-6 pt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                                  <span className="font-extrabold text-slate-700 dark:text-white">Explanation: </span>
                                  <MathText text={q.explanation} />
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-slate-500 text-xs font-bold">
                          Question breakdown is not available for this record.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: TOPIC MASTERY BREAKDOWN */}
                  {activeViewTab === "topics" && (
                    <div className="space-y-4">
                      {selectedSubDetail.topic_analysis && Object.keys(selectedSubDetail.topic_analysis).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(selectedSubDetail.topic_analysis).map(([topicName, tdata]: [string, any]) => {
                            const acc = tdata.accuracy ?? 0;
                            return (
                              <div key={topicName} className="p-4.5 rounded-2xl bg-slate-55/30 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-850 dark:text-white">{topicName}</span>
                                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{acc}% Accuracy</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      acc >= 75 ? "bg-emerald-500" : acc >= 50 ? "bg-amber-500" : "bg-rose-500"
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, acc))}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                  <span>{tdata.correct || 0} of {tdata.total || 0} correct</span>
                                  <span>{acc >= 75 ? "Mastered" : acc >= 50 ? "Developing" : "Needs Review"}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-500 text-xs font-bold">
                          Topic analysis is not available for this exam.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: LEADERBOARD */}
                  {activeViewTab === "leaderboard" && (
                    <div className="space-y-3">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-202 dark:border-slate-800 rounded-2xl overflow-hidden">
                        {leaderboard.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-500 font-bold">No leaderboard data available.</div>
                        ) : (
                          leaderboard.map((lb: any, idx: number) => {
                            const isMe = lb.student_name === fullName || lb.name === fullName;
                            return (
                              <div
                                key={idx}
                                className={`p-3.5 flex items-center justify-between text-xs transition-colors ${
                                  isMe 
                                    ? "bg-blue-500/10 dark:bg-blue-400/15 font-semibold" 
                                    : "bg-white dark:bg-[#131b2e] hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                    idx === 0 ? "bg-amber-100 text-amber-800" : idx === 1 ? "bg-slate-200 text-slate-700" : idx === 2 ? "bg-amber-700/20 text-amber-900" : "text-slate-400"
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className="text-slate-900 dark:text-white font-medium">
                                    {lb.student_name || lb.name || "Candidate"} {isMe && "(You)"}
                                  </span>
                                </div>
                                <span className="font-extrabold text-blue-650 dark:text-blue-400">
                                  {lb.percentage || lb.score}%
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : null}
            </div>

          </div>
        )
      )}

      {/* PORTAL TAB 3: LEARNING TRENDS & MASTERY */}
      {activePortalTab === "progress" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Banner */}
          <div className="bg-white dark:bg-[#131b2e] border border-slate-202 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-650" />
                  <span>Performance & Topic Mastery Diagnosis</span>
                </h2>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                  AI-driven analytics analyzing score trajectories and subject area proficiency.
                </p>
              </div>

              {progressData?.average_percentage && (
                <div className="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-xl text-center shrink-0 border border-blue-500/20">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider">Overall Mastery</div>
                  <div className="text-xl font-extrabold">{progressData.average_percentage}%</div>
                </div>
              )}
            </div>

            {/* Strengths & Weaknesses Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-350">
                  <CheckCircle2 className="h-4 w-4 text-emerald-650" />
                  <span>Topic Strengths</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {progressData?.strength_topics?.length > 0 ? (
                    progressData.strength_topics.map((st: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-100/50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-md text-xs font-bold">
                        {st}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Complete more quizzes to identify strengths.</span>
                  )}
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Recommended Focus Areas</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {progressData?.weak_topics?.length > 0 ? (
                    progressData.weak_topics.map((wt: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-amber-100/50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-md text-xs font-bold">
                        {wt}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No weak topics detected. Great job!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score History Line Chart */}
            <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>Score Trajectory Over Time</span>
              </h3>
              <div className="h-64 w-full pt-2">
                {progressData?.score_trend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData.score_trend}>
                      <XAxis dataKey="date" stroke="#716D67" fontSize={10} />
                      <YAxis domain={[0, 100]} stroke="#716D67" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderRadius: '8px', color: '#fff', fontSize: '12px', borderColor: '#1e293b' }} />
                      <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 font-semibold">
                    No submission trend history recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Topic Mastery Radar Chart */}
            <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span>Topic Mastery Breakdown (%)</span>
              </h3>
              <div className="h-64 w-full pt-2">
                {progressData?.topic_mastery?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={progressData.topic_mastery}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="topic" stroke="#716D67" fontSize={9} />
                      <Radar name="Accuracy" dataKey="accuracy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderRadius: '8px', color: '#fff', fontSize: '12px', borderColor: '#1e293b' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 font-semibold">
                    Complete assessments to generate topic mastery breakdown.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
