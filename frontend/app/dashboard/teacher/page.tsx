"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useToast } from "../../../components/Toast";
import { apiFetch, API_V1, getWebSocketUrl } from "../../../lib/api";
import { 
  Plus, BookOpen, Calendar, ChevronRight, ChevronDown, Check,
  Users, BarChart3, GraduationCap, Clock, 
  Sparkles, ArrowRight, ArrowLeft, Radio, FileSpreadsheet,
  UploadCloud, FileUp, FileText, Loader2, CheckCircle2, X
} from "lucide-react";

import StudentDirectoryManager from "./_components/StudentDirectoryManager";
import CreateDirectoryModal from "./_components/CreateDirectoryModal";
import KnowledgeBaseManager from "./_components/KnowledgeBaseManager";
import QuestionBankManager from "./_components/QuestionBankManager";
import LiveAssessmentsTable from "./_components/LiveAssessmentsTable";
import PaperStudioModal from "./_components/PaperStudioModal";
import LiveProctoringModal from "./_components/LiveProctoringModal";
import GradebookAnalytics from "./_components/GradebookAnalytics";
import UploadKBModal from "./_components/UploadKBModal";
import { fetchStudentDirectories } from "@/lib/api/studentDirectories";
import { StudentDirectory } from "@/types/studentDirectory";

export default function TeacherDashboard() {
  const { token, fullName } = useAuthStore();
  const { showToast } = useToast();
  
  const [activeSectionTab, setActiveSectionTab] = useState<string>("all");

  const switchSectionTab = (tab: string) => {
    setActiveSectionTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab === "all" ? "" : tab;
    }
    fetchData();
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveSectionTab(hash);
      }
    };
    handleHash();
    const handleCustom = (e: any) => {
      if (e.detail) {
        setActiveSectionTab(e.detail);
      }
    };
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("switch-tab", handleCustom);
    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("switch-tab", handleCustom);
    };
  }, []);
  
  // Data states
  const [createStep, setCreateStep] = useState<number>(1);
  const [documents, setDocuments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any | null>(null);
  const [kbSubjects, setKbSubjects] = useState<any[]>([]);
  
  // Step 1 Direct KB Upload state
  const [step1SourceMode, setStep1SourceMode] = useState<"select" | "upload">("select");
  const [step1UploadFile, setStep1UploadFile] = useState<File | null>(null);
  const [step1UploadSubject, setStep1UploadSubject] = useState("");
  const [isStep1Uploading, setIsStep1Uploading] = useState(false);
  const [step1UploadSuccess, setStep1UploadSuccess] = useState<{ fileName: string; subjectId: string } | null>(null);
  const [isStep1KbModalOpen, setIsStep1KbModalOpen] = useState(false);
  const [step1IsDragging, setStep1IsDragging] = useState(false);
  
  // Modal states
  const [previewExam, setPreviewExam] = useState<any | null>(null);
  const [liveProctorExam, setLiveProctorExam] = useState<any | null>(null);
  const [liveProctorAlerts, setLiveProctorAlerts] = useState<any[]>([]);

  // Form: Exam Generator
  const [examName, setExamName] = useState("");
  const [examSubject, setExamSubject] = useState("");
  const [examTopic, setExamTopic] = useState("General");
  const [examDuration, setExamDuration] = useState("30");
  const [examMarks, setExamMarks] = useState("50");
  const [examPass, setExamPass] = useState("20");
  const [examNegative, setExamNegative] = useState("0");
  const [numMcq, setNumMcq] = useState("5");
  const [numSubjective, setNumSubjective] = useState("0");
  const [questionType, setQuestionType] = useState<"mcq" | "subjective" | "tf" | "mixed">("mcq");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [cognitiveTarget, setCognitiveTarget] = useState("apply");
  const [diffEasyPct, setDiffEasyPct] = useState(30);
  const [diffMedPct, setDiffMedPct] = useState(50);
  const [diffHardPct, setDiffHardPct] = useState(20);
  const [customPromptInstructions, setCustomPromptInstructions] = useState("");
  const [examStartDate, setExamStartDate] = useState("");
  const [examEndDate, setExamEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [studentDirectories, setStudentDirectories] = useState<StudentDirectory[]>([]);
  const [selectedDirectoryId, setSelectedDirectoryId] = useState<string>("");
  const [isCreateDirModalOpen, setIsCreateDirModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string>("");

  // Load initial data
  const fetchData = async () => {
    if (!token) return;
    try {
      if (typeof window !== "undefined") {
        setWorkspaceName(localStorage.getItem("workspaceName") || "Teacher Workspace");
      }
      const [docsRes, examsRes, subjectsRes, dirsRes] = await Promise.all([
        apiFetch("/kb/documents", { token }).catch(() => null),
        apiFetch("/exams/", { token }).catch(() => null),
        apiFetch("/kb/subjects", { token }).catch(() => null),
        fetchStudentDirectories(token).catch(() => []),
      ]);

      if (docsRes && docsRes.ok) setDocuments(await docsRes.json().catch(() => []));
      if (examsRes && examsRes.ok) setExams(await examsRes.json().catch(() => []));
      if (subjectsRes && subjectsRes.ok) setKbSubjects(await subjectsRes.json().catch(() => []));
      if (Array.isArray(dirsRes)) {
        setStudentDirectories(dirsRes);
        if (dirsRes.length > 0 && !selectedDirectoryId) {
          setSelectedDirectoryId(dirsRes[0].id);
        }
      }
    } catch (e) {
      console.warn("fetchData notice:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    const handleSwitch = (e: any) => {
      const el = document.getElementById(e.detail);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("switch-tab", handleSwitch);
    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("switch-tab", handleSwitch);
    };
  }, []);

  // WebSocket Live Proctoring alerts feed
  useEffect(() => {
    if (!liveProctorExam || !token) return;

    let ws: WebSocket | null = null;
    try {
      const wsUrl = getWebSocketUrl(`/attempts/ws/teacher/${liveProctorExam.id}`);
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);
          setLiveProctorAlerts((prev) => [alert, ...prev]);
          showToast(`⚠️ Proctor Flag: ${alert.event_type || "Violation"} - ${alert.details || ""}`, "error");
        } catch {}
      };

      ws.onerror = () => {
        console.warn("Proctor WebSocket connection error");
      };
    } catch {}

    return () => {
      if (ws) ws.close();
    };
  }, [liveProctorExam, token]);

  // Exam Action Handlers
  const handlePublishExam = async (examId: string) => {
    try {
      const res = await apiFetch(`/exams/${examId}/publish`, { token, method: "POST" });
      if (res.ok) {
        showToast("Assessment published live to eligible candidates!", "success");
        fetchData();
      } else {
        showToast("Failed to publish assessment", "error");
      }
    } catch {
      showToast("Network error while publishing assessment", "error");
    }
  };

  const handleEndExamEarly = async (examId: string) => {
    try {
      const res = await apiFetch(`/exams/${examId}/end`, { token, method: "POST" });
      if (res.ok) {
        showToast("Assessment manually terminated for all candidates.", "success");
        setLiveProctorExam(null);
        fetchData();
      } else {
        showToast("Failed to terminate assessment", "error");
      }
    } catch {
      showToast("Network error while terminating assessment", "error");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this assessment? This will delete all student records and responses associated with it.")) return;
    try {
      const res = await apiFetch(`/exams/${examId}`, { token, method: "DELETE" });
      if (res.ok) {
        showToast("Assessment successfully deleted", "success");
        setPreviewExam(null);
        fetchData();
      } else {
        showToast("Failed to delete assessment", "error");
      }
    } catch {
      showToast("Network error while deleting assessment", "error");
    }
  };

  const handleGenerateCredentials = async (examId: string) => {
    try {
      const res = await apiFetch(`/exams/${examId}/generate-passcodes`, { token, method: "POST" });
      if (res.ok) {
        showToast("Candidate credentials and passcodes generated successfully!", "success");
        fetchData();
      } else {
        showToast("Failed to generate passcodes", "error");
      }
    } catch {
      showToast("Network error while generating passcodes", "error");
    }
  };

  const handleDownloadCredentialsCSV = async (examId: string, examName: string) => {
    try {
      const res = await apiFetch(`/exams/${examId}/export-passcodes-csv`, { token });
      if (res.ok) {
        const text = await res.text();
        const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Credentials_${examName.replace(/\s+/g, "_")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showToast("Failed to download CSV", "error");
      }
    } catch {
      showToast("Network error while downloading credentials CSV", "error");
    }
  };

  // Exam Generator Submit
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      showToast("Please enter an assessment name", "error");
      return;
    }
    if (!examSubject) {
      showToast("Please select or upload a knowledge source first", "error");
      return;
    }

    setIsGenerating(true);
    try {
      // Build simple blueprint configuration matching back-end payload schema
      const totalMarksNum = parseFloat(examMarks) || 100;
      
      // Calculate dynamic MCQ vs subjective counts based on type
      let finalMcqCount = parseInt(numMcq) || 5;
      let finalSubjCount = parseInt(numSubjective) || 0;

      if (questionType === "mcq") {
        finalSubjCount = 0;
      } else if (questionType === "subjective") {
        finalMcqCount = 0;
      } else if (questionType === "tf") {
        finalMcqCount = parseInt(numMcq) || 5; // Reused numMcq state
        finalSubjCount = 0;
      }

      const blueprint: any = {
        difficulty_profile: difficulty,
        cognitive_target: cognitiveTarget,
        topic: examTopic || "General",
        question_distribution: {
          mcq: finalMcqCount,
          subjective: finalSubjCount,
          tf: questionType === "tf" ? finalMcqCount : 0
        }
      };

      const payload = {
        name: examName,
        subject_id: examSubject,
        duration_minutes: parseInt(examDuration) || 30,
        total_marks: totalMarksNum,
        passing_marks: parseFloat(examPass) || 20,
        negative_marking: parseFloat(examNegative) || 0,
        start_time: examStartDate ? new Date(examStartDate).toISOString() : null,
        end_time: examEndDate ? new Date(examEndDate).toISOString() : null,
        student_directory_id: selectedDirectoryId || null,
        blueprint: blueprint,
        enable_ai_paper: true,
      };

      const res = await apiFetch("/exams/generate-from-kb", {
        token,
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newExam = await res.json();
        showToast(`Assessment "${newExam.name}" successfully created!`, "success");
        setCreateStep(1);
        setExamName("");
        setActiveSectionTab("exams");
        if (typeof window !== "undefined") {
          window.location.hash = "exams";
        }
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || "Assessment generation failed. Please try again.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Network error while generating assessment", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const validateAndSetStep1File = (file: File) => {
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSizeBytes) {
      showToast("File size exceeds 25MB limit. Please choose a smaller document.", "error");
      return;
    }
    setStep1UploadFile(file);

    // Auto-suggest subject name if empty
    if (!step1UploadSubject) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setStep1UploadSubject(cleanName.slice(0, 30));
    }
  };

  const handleStep1DirectUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!step1UploadFile) {
      showToast("Please select or drop a document to upload.", "error");
      return;
    }
    if (!step1UploadSubject.trim()) {
      showToast("Please specify a subject domain name for this document.", "error");
      return;
    }

    setIsStep1Uploading(true);
    try {
      const formData = new FormData();
      formData.append("file", step1UploadFile);
      formData.append("subject_id", step1UploadSubject.trim());

      const res = await apiFetch("/kb/upload", {
        token,
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const sub = step1UploadSubject.trim();
        const fName = step1UploadFile.name;
        showToast(`Document "${fName}" indexed into "${sub}"!`, "success");
        setStep1UploadSuccess({ fileName: fName, subjectId: sub });
        setExamSubject(sub);

        // Auto-fill exam title if empty
        if (!examName) {
          const cleanName = fName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          setExamName(`${cleanName} Assessment`);
        }

        // Auto-fill topic if default
        if (!examTopic || examTopic === "General") {
          setExamTopic(sub);
        }

        setStep1UploadFile(null);
        setStep1UploadSubject("");
        setStep1SourceMode("select");

        // Refresh subjects and documents
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || "Upload failed. Please check the document format.", "error");
      }
    } catch {
      showToast("Upload network error. Please verify backend connection.", "error");
    } finally {
      setIsStep1Uploading(false);
    }
  };

  const formatLocalDateTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const setSchedulePreset = (preset: string) => {
    const now = new Date();
    const durMins = parseInt(examDuration) || 30;
    if (preset === "now") {
      setExamStartDate(formatLocalDateTime(now));
      const end = new Date(now.getTime() + durMins * 60000);
      setExamEndDate(formatLocalDateTime(end));
    } else if (preset === "open30days") {
      setExamStartDate(formatLocalDateTime(now));
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60000);
      setExamEndDate(formatLocalDateTime(end));
    } else if (preset === "today4pm") {
      const start = new Date();
      start.setHours(16, 0, 0, 0);
      if (now > start) {
        start.setDate(start.getDate() + 1);
      }
      setExamStartDate(formatLocalDateTime(start));
      const end = new Date(start.getTime() + durMins * 60000);
      setExamEndDate(formatLocalDateTime(end));
    } else if (preset === "tomorrow10am") {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(10, 0, 0, 0);
      setExamStartDate(formatLocalDateTime(start));
      const end = new Date(start.getTime() + durMins * 60000);
      setExamEndDate(formatLocalDateTime(end));
    }
  };

  const labelCls = "block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider";
  const inputCls = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium";

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Instructor Studio Dashboard
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Teacher Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Welcome back, <b className="text-slate-700 dark:text-slate-350">{fullName || "Instructor"}</b>. Autonomous AI assessment synthesis & proctoring sandbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.location.hash = "create";
              document.getElementById("create")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Assessments</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{exams.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{exams.filter((e) => e.is_published).length} Published Live</div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>Vector Docs</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{documents.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase">RAG Indexed Sources</div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Student Directories</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{studentDirectories.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Cohort Rosters</div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>AI Copilot</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">Active</div>
          <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Gemini Models Online</div>
        </div>
      </div>

      {/* View Switcher Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 no-scrollbar">
        <button
          onClick={() => switchSectionTab("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSectionTab === "all"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All Overview
        </button>

        <button
          onClick={() => switchSectionTab("exams")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSectionTab === "exams"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Assessments ({exams.length})</span>
        </button>

        <button
          onClick={() => switchSectionTab("create")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSectionTab === "create"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Assessment Wizard</span>
        </button>

        <button
          onClick={() => switchSectionTab("bank")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSectionTab === "bank"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Question Bank</span>
        </button>

        <button
          onClick={() => switchSectionTab("kb")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSectionTab === "kb"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Knowledge Base ({documents.length})</span>
        </button>

        <button
          onClick={() => switchSectionTab("students")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSectionTab === "students"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Student Directory ({studentDirectories.length})</span>
        </button>

        <button
          onClick={() => switchSectionTab("reports")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSectionTab === "reports"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Gradebook Analytics</span>
        </button>
      </div>

      {/* SECTION 1: ASSESSMENTS TABLE */}
      {(activeSectionTab === "all" || activeSectionTab === "exams") && (
      <section id="exams" className="scroll-mt-16 space-y-4">
        <LiveAssessmentsTable
          exams={exams}
          onOpenCreate={() => {
            const el = document.getElementById("create");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onPreviewExam={(exam) => setPreviewExam(exam)}
          onOpenLiveProctor={(exam) => {
            setLiveProctorExam(exam);
            setLiveProctorAlerts([]);
          }}
          onEndExamEarly={handleEndExamEarly}
          onPublishExam={handlePublishExam}
          onDeleteExam={handleDeleteExam}
          onGenerateCredentials={handleGenerateCredentials}
          onDownloadCredentialsCSV={handleDownloadCredentialsCSV}
        />
      </section>
      )}

      {/* SECTION 2: CREATE ASSESSMENT WORKFLOW WIZARD */}
      {(activeSectionTab === "all" || activeSectionTab === "create") && (
      <section id="create" className="scroll-mt-16 space-y-4">
        <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Create New Assessment Room
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Follow the 4 setup steps below to generate and publish your examination paper.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold self-start sm:self-auto">
              <span>Step {createStep} of 4</span>
            </div>
          </div>

          {/* TOP-DOWN VERTICAL STEPPER */}
          <form onSubmit={handleCreateExam} className="space-y-4">
            
            {/* STEP 1: CONTENT SOURCE */}
            <div className={`border rounded-2xl transition-all overflow-hidden ${
              createStep === 1
                ? "bg-white dark:bg-[#131b2e] border-blue-500/40 shadow-sm ring-1 ring-blue-500/20"
                : createStep > 1
                ? "bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800"
                : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80"
            }`}>
              {/* Step 1 Header */}
              <div
                onClick={() => setCreateStep(1)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    createStep > 1
                      ? "bg-emerald-600 text-white"
                      : createStep === 1
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-550"
                  }`}>
                    {createStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      01. Knowledge Source & Assessment Details
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {examName ? `${examName} • ${examSubject || "General"}` : "Select curriculum domain and title"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {createStep > 1 && (
                    <span className="text-xs font-bold text-blue-650 hover:underline">Edit</span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${createStep === 1 ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Step 1 Body */}
              {createStep === 1 && (
                <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 max-w-xl animate-fadeIn">
                  
                  {/* Knowledge Source Selection / Upload Dual-Mode Toggle */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Knowledge Source</label>
                      <button
                        type="button"
                        onClick={() => setIsStep1KbModalOpen(true)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ Upload New KB</span>
                      </button>
                    </div>

                    {/* Mode Toggle Switcher */}
                    <div className="flex p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-250/60 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setStep1SourceMode("select")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          step1SourceMode === "select"
                            ? "bg-white dark:bg-[#131b2e] text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Existing Knowledge Base</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep1SourceMode("upload")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          step1SourceMode === "upload"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Upload New Document</span>
                      </button>
                    </div>

                    {/* Notification Chip if document was just uploaded */}
                    {step1UploadSuccess && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>
                            Indexed <b>&ldquo;{step1UploadSuccess.fileName}&rdquo;</b> &rarr; Selected <b>&ldquo;{step1UploadSuccess.subjectId}&rdquo;</b>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep1UploadSuccess(null)}
                          className="text-emerald-600 hover:text-emerald-800 p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* MODE A: Select from Existing Knowledge Base */}
                    {step1SourceMode === "select" ? (
                      <div className="space-y-1.5">
                        {kbSubjects.length > 0 ? (
                          <select
                            required
                            value={examSubject}
                            onChange={(e) => {
                              setExamSubject(e.target.value);
                              if (step1UploadSuccess && e.target.value !== step1UploadSuccess.subjectId) {
                                setStep1UploadSuccess(null);
                              }
                            }}
                            className={inputCls}
                          >
                            <option value="">Select Knowledge Source...</option>
                            {kbSubjects.map((s) => (
                              <option key={s.subject_id} value={s.subject_id}>
                                {s.name} ({s.document_count} document{s.document_count > 1 ? "s" : ""})
                              </option>
                            ))}
                            <option value="general_101">General Knowledge Base</option>
                          </select>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              required
                              value={examSubject}
                              onChange={(e) => setExamSubject(e.target.value)}
                              placeholder="e.g. general_101 or ai_unit_1"
                              className={inputCls}
                            />
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                              No existing KB documents found. Switch to &ldquo;Upload New Document&rdquo; above to add your materials!
                            </p>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                          Questions will be generated using documents in this selected subject.
                        </p>
                      </div>
                    ) : (
                      /* MODE B: Direct Inline KB Document Upload */
                      <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Subject / Knowledge Domain <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={step1UploadSubject}
                            onChange={(e) => setStep1UploadSubject(e.target.value)}
                            placeholder="e.g. Machine_Learning_Unit_1"
                            list="existing-kb-subjects-list"
                            className={inputCls}
                          />
                          {kbSubjects.length > 0 && (
                            <datalist id="existing-kb-subjects-list">
                              {kbSubjects.map((s) => (
                                <option key={s.subject_id} value={s.subject_id} />
                              ))}
                            </datalist>
                          )}
                        </div>

                        {/* Dropzone */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setStep1IsDragging(true);
                          }}
                          onDragLeave={() => setStep1IsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setStep1IsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              validateAndSetStep1File(e.dataTransfer.files[0]);
                            }
                          }}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                            step1IsDragging
                              ? "border-blue-500 bg-blue-500/5"
                              : step1UploadFile
                              ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                              : "border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-[#131b2e]"
                          }`}
                          onClick={() => {
                            const input = document.getElementById("step1-file-input");
                            if (input) input.click();
                          }}
                        >
                          <input
                            id="step1-file-input"
                            type="file"
                            accept=".pdf,.txt,.docx,.pptx,.md"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                validateAndSetStep1File(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />

                          {step1UploadFile ? (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#131b2e] border border-emerald-500/30">
                              <div className="flex items-center gap-2.5 text-left truncate">
                                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-450 shrink-0" />
                                <div className="truncate">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{step1UploadFile.name}</div>
                                  <div className="text-[10px] text-slate-500">{(step1UploadFile.size / 1024).toFixed(1)} KB</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStep1UploadFile(null);
                                }}
                                className="p-1 text-rose-500 hover:text-rose-700 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1 py-1">
                              <UploadCloud className="h-6 w-6 text-blue-600 mx-auto" />
                              <div className="text-xs font-bold text-slate-850 dark:text-white">
                                Drop document file or click to browse
                              </div>
                              <div className="text-[10px] text-slate-450">
                                PDF, DOCX, TXT, PPTX (Max 25MB)
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Upload & Index Button */}
                        <button
                          type="button"
                          onClick={() => handleStep1DirectUpload()}
                          disabled={isStep1Uploading || !step1UploadFile || !step1UploadSubject.trim()}
                          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isStep1Uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Indexing into Vector DB...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" />
                              <span>Upload & Use as Knowledge Source</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Assessment Title</label>
                    <input
                      type="text"
                      required
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder="e.g. Unit 1 Examination Paper"
                      className={inputCls}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Topic Keyword Focus</label>
                    <input
                      type="text"
                      value={examTopic}
                      onChange={(e) => setExamTopic(e.target.value)}
                      placeholder="e.g. Neural Networks, Machine Learning"
                      className={inputCls}
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button type="button" onClick={() => setCreateStep(2)} className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                      <span>Continue to Questions</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: QUESTIONS CONFIG */}
            <div className={`border rounded-2xl transition-all overflow-hidden ${
              createStep === 2
                ? "bg-white dark:bg-[#131b2e] border-blue-500/40 shadow-sm ring-1 ring-blue-500/20"
                : createStep > 2
                ? "bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800"
                : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80"
            }`}>
              {/* Step 2 Header */}
              <div
                onClick={() => setCreateStep(2)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    createStep > 2
                      ? "bg-emerald-600 text-white"
                      : createStep === 2
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-550"
                  }`}>
                    {createStep > 2 ? <Check className="h-4 w-4" /> : "2"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      02. Question Format, Difficulty & AI Blueprint
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {numMcq} MCQ • {numSubjective} Subjective • Difficulty: {difficulty.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {createStep > 2 && (
                    <span className="text-xs font-bold text-blue-650 hover:underline">Edit</span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${createStep === 2 ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Step 2 Body */}
              {createStep === 2 && (
                <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 max-w-xl animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Question Format</label>
                      <select
                        value={questionType}
                        onChange={(e: any) => setQuestionType(e.target.value)}
                        className={inputCls}
                      >
                        <option value="mcq">Multiple Choice (MCQ)</option>
                        <option value="subjective">Subjective / Descriptive</option>
                        <option value="tf">True / False</option>
                        <option value="mixed">Mixed (MCQ + Subjective)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Difficulty Level</label>
                      <select
                        value={difficulty}
                        onChange={(e: any) => setDifficulty(e.target.value)}
                        className={inputCls}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional Question Count Controls */}
                  {questionType === "mcq" && (
                    <div className="space-y-1.5">
                      <label className={labelCls}>Number of Multiple Choice Questions (MCQs)</label>
                      <input
                        type="number"
                        value={numMcq}
                        onChange={(e) => setNumMcq(e.target.value)}
                        min="1"
                        max="50"
                        className={inputCls}
                      />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                        Each question will have 4 options with a single correct answer.
                      </p>
                    </div>
                  )}

                  {questionType === "tf" && (
                    <div className="space-y-1.5">
                      <label className={labelCls}>Number of True / False Questions</label>
                      <input
                        type="number"
                        value={numMcq}
                        onChange={(e) => setNumMcq(e.target.value)}
                        min="1"
                        max="50"
                        className={inputCls}
                      />
                    </div>
                  )}

                  {questionType === "subjective" && (
                    <div className="space-y-1.5">
                      <label className={labelCls}>Number of Subjective Questions</label>
                      <input
                        type="number"
                        value={numSubjective || "5"}
                        onChange={(e) => setNumSubjective(e.target.value)}
                        min="1"
                        max="20"
                        className={inputCls}
                      />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                        Students will provide descriptive answers evaluated against rubric key concepts.
                      </p>
                    </div>
                  )}

                  {questionType === "mixed" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelCls}>No. of MCQs</label>
                        <input
                          type="number"
                          value={numMcq}
                          onChange={(e) => setNumMcq(e.target.value)}
                          min="1"
                          max="40"
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelCls}>No. of Subjective</label>
                        <input
                          type="number"
                          value={numSubjective || "2"}
                          onChange={(e) => setNumSubjective(e.target.value)}
                          min="1"
                          max="15"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}

                  {/* AI Cognitive Target & Custom Guidelines */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 pt-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-850 dark:text-white">
                        AI Blueprint Co-Pilot Tuning
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                          Bloom's Cognitive Target
                        </label>
                        <select
                          value={cognitiveTarget}
                          onChange={(e: any) => setCognitiveTarget(e.target.value)}
                          className={inputCls}
                        >
                          <option value="recall">Recall & Definitions (Knowledge)</option>
                          <option value="understand">Conceptual Understanding</option>
                          <option value="apply">Application & Problem Solving</option>
                          <option value="analyze">Critical Analysis & Reasoning</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                          Difficulty Ratio Blend
                        </label>
                        <div className="flex items-center gap-2.5 pt-2">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Easy: {diffEasyPct}%</span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Med: {diffMedPct}%</span>
                          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Hard: {diffHardPct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                        Teacher Instructions to AI Generator
                      </label>
                      <textarea
                        rows={2.5}
                        value={customPromptInstructions}
                        onChange={(e) => setCustomPromptInstructions(e.target.value)}
                        placeholder="e.g. Include code snippets, focus on calculations, avoid trivial definitions..."
                        className="w-full bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-850 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </button>
                    <button type="button" onClick={() => setCreateStep(3)} className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                      <span>Continue to Rules</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: RULES & SCHEDULING */}
            <div className={`border rounded-2xl transition-all overflow-hidden ${
              createStep === 3
                ? "bg-white dark:bg-[#131b2e] border-blue-500/40 shadow-sm ring-1 ring-blue-500/20"
                : createStep > 3
                ? "bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800"
                : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80"
            }`}>
              {/* Step 3 Header */}
              <div
                onClick={() => setCreateStep(3)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    createStep > 3
                      ? "bg-emerald-600 text-white"
                      : createStep === 3
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-550"
                  }`}>
                    {createStep > 3 ? <Check className="h-4 w-4" /> : "3"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      03. Duration, Marks & Schedule Window
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {examDuration} Minutes • {examMarks} Total Marks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {createStep > 3 && (
                    <span className="text-xs font-bold text-blue-650 hover:underline">Edit</span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${createStep === 3 ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Step 3 Body */}
              {createStep === 3 && (
                <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 max-w-xl animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Duration (Minutes)</label>
                      <input
                        type="number"
                        value={examDuration}
                        onChange={(e) => setExamDuration(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Total Marks</label>
                      <input
                        type="number"
                        value={examMarks}
                        onChange={(e) => setExamMarks(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="space-y-2 pt-1">
                    <label className={labelCls}>Quick Schedule Presets</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSchedulePreset("now")}
                        className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 hover:border-blue-500 cursor-pointer transition-all"
                      >
                        ⚡ Start Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchedulePreset("open30days")}
                        className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 hover:border-blue-500 cursor-pointer transition-all"
                      >
                        📅 30-Day Window
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchedulePreset("today4pm")}
                        className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 hover:border-blue-500 cursor-pointer transition-all"
                      >
                        Today 4 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchedulePreset("tomorrow10am")}
                        className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 hover:border-blue-500 cursor-pointer transition-all"
                      >
                        Tomorrow 10 AM
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={examStartDate}
                        onChange={(e) => setExamStartDate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={examEndDate}
                        onChange={(e) => setExamEndDate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(2)}
                      className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-850 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </button>
                    <button type="button" onClick={() => setCreateStep(4)} className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                      <span>Review & Generate</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: REVIEW & GENERATE */}
            <div className={`border rounded-2xl transition-all overflow-hidden ${
              createStep === 4
                ? "bg-white dark:bg-[#131b2e] border-blue-500/40 shadow-sm ring-1 ring-blue-500/20"
                : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80"
            }`}>
              {/* Step 4 Header */}
              <div
                onClick={() => setCreateStep(4)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    createStep === 4
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-550"
                  }`}>
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      04. Final Blueprint Review & AI Paper Synthesis
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Confirm blueprint specs and generate assessment
                    </p>
                  </div>
                </div>

                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${createStep === 4 ? "rotate-180" : ""}`} />
              </div>

              {/* Step 4 Body */}
              {createStep === 4 && (
                <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-5 max-w-xl animate-fadeIn">
                  {/* Student Directory Selector with + Create Directory button */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-blue-650" />
                        <span>Target Student Directory</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreateDirModalOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Student Directory</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {studentDirectories.length > 0 ? (
                        <select
                          value={selectedDirectoryId}
                          onChange={(e) => setSelectedDirectoryId(e.target.value)}
                          className={inputCls}
                        >
                          <option value="">No Directory (Open Access)</option>
                          {studentDirectories.map((dir) => (
                            <option key={dir.id} value={dir.id}>
                              {dir.name} ({dir.student_count} candidate{dir.student_count !== 1 ? 's' : ''})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-center">
                          <p className="text-xs text-slate-550 mb-2.5 font-medium">No student directory created yet.</p>
                          <button
                            type="button"
                            onClick={() => setIsCreateDirModalOpen(true)}
                            className="px-3.5 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create First Student Directory</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                      Eligible students in this directory will be snapped as assessment candidates.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-2.5 text-xs">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                      Assessment Synthesis Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-500 font-medium">
                      <div>Title: <b className="text-slate-805 dark:text-slate-200">{examName || "Untitled Assessment"}</b></div>
                      <div>Source: <b className="text-slate-805 dark:text-slate-200">{examSubject || "General"}</b></div>
                      <div>Questions: <b className="text-slate-805 dark:text-slate-200">{parseInt(numMcq) + parseInt(numSubjective)} Total ({numMcq} MCQ)</b></div>
                      <div>Duration: <b className="text-slate-805 dark:text-slate-200">{examDuration} min</b></div>
                      <div>Marks: <b className="text-slate-805 dark:text-slate-200">{examMarks} pts</b></div>
                      <div>Directory: <b className="text-slate-805 dark:text-slate-200">{studentDirectories.find(d => d.id === selectedDirectoryId)?.name || "Open / Unassigned"}</b></div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCreateStep(3)}
                      className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-850 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </button>
                    <button type="submit" disabled={isGenerating} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-755 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50">
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Synthesizing Exam Paper...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Generate & Publish Assessment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>
      </section>
      )}

      {/* SECTION 3: QUESTION BANK STUDIO */}
      {(activeSectionTab === "all" || activeSectionTab === "bank") && (
      <section id="bank" className="scroll-mt-16 space-y-4">
        <QuestionBankManager />
      </section>
      )}

      {/* SECTION 4: KNOWLEDGE SOURCES (RAG VECTOR DB) */}
      {(activeSectionTab === "all" || activeSectionTab === "kb") && (
      <section id="kb" className="scroll-mt-16 space-y-4">
        <KnowledgeBaseManager
          documents={documents}
          token={token}
          onRefresh={fetchData}
        />
      </section>
      )}

      {/* SECTION 5: STUDENT DIRECTORY MANAGER */}
      {(activeSectionTab === "all" || activeSectionTab === "students") && (
      <section id="students" className="scroll-mt-16 space-y-4">
        <StudentDirectoryManager />
      </section>
      )}

      {/* Inline Create Directory Modal */}
      <CreateDirectoryModal
        isOpen={isCreateDirModalOpen}
        onClose={() => setIsCreateDirModalOpen(false)}
        onCreated={(newDir) => {
          setStudentDirectories((prev) => [newDir, ...prev]);
          setSelectedDirectoryId(newDir.id);
          showToast(`Student Directory "${newDir.name}" created and selected!`, "success");
        }}
      />

      {/* Step 1 Quick Upload KB Modal */}
      <UploadKBModal
        isOpen={isStep1KbModalOpen}
        onClose={() => setIsStep1KbModalOpen(false)}
        token={token}
        availableSubjects={kbSubjects}
        onUploaded={(subId, fName) => {
          setStep1UploadSuccess({ fileName: fName, subjectId: subId });
          setExamSubject(subId);
          if (!examName) {
            const cleanName = fName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            setExamName(`${cleanName} Assessment`);
          }
          if (!examTopic || examTopic === "General") {
            setExamTopic(subId);
          }
          setStep1SourceMode("select");
          fetchData();
        }}
      />

      {/* SECTION 6: GENERALIZED CLASSROOM QUIZ ANALYTICS */}
      {(activeSectionTab === "all" || activeSectionTab === "reports") && (
      <section id="reports" className="scroll-mt-16 space-y-4">
        <GradebookAnalytics exams={exams} />
      </section>
      )}

      {/* GLOBAL PAPER STUDIO PREVIEW MODAL */}
      {previewExam && (
        <PaperStudioModal
          exam={previewExam}
          onClose={() => setPreviewExam(null)}
          onRefresh={fetchData}
          onPublishExam={handlePublishExam}
          onEndExamEarly={handleEndExamEarly}
          onDeleteExam={handleDeleteExam}
        />
      )}

      {/* GLOBAL LIVE ANTI-CHEAT PROCTORING COMMAND CENTER MODAL */}
      {liveProctorExam && (
        <LiveProctoringModal
          exam={liveProctorExam}
          alerts={liveProctorAlerts}
          onClose={() => setLiveProctorExam(null)}
          onEndExamEarly={handleEndExamEarly}
        />
      )}
    </div>
  );
}
