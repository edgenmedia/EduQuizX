"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "../../lib/api";
import { 
  GraduationCap, 
  BookOpen, 
  School, 
  Menu, 
  X, 
  LogOut, 
  Sliders, 
  Bell, 
  ExternalLink,
  UserCheck,
  Search,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Layers,
  FileText,
  Users,
  BarChart2,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, fullName, role, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("exams");
  
  // Notification Center State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/notifications/?limit=10", { token });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
      const countRes = await apiFetch("/notifications/unread-count", { token });
      if (countRes.ok) {
        const cData = await countRes.json();
        setUnreadCount(cData.count || 0);
      }
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { token, method: "POST" });
      fetchNotifications();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { token, method: "POST" });
      fetchNotifications();
    } catch {}
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      useAuthStore.getState().syncFromStorage();
      const savedCollapsed = localStorage.getItem("sidebar_collapsed");
      if (savedCollapsed !== null) {
        setSidebarCollapsed(savedCollapsed === "true");
      }
    }
    setMounted(true);
    const saved = localStorage.getItem("theme_mode") as "light" | "dark" | "system" | null;
    const mode = saved || "light";
    setThemeMode(mode);
    applyTheme(mode);
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [token]);

  const applyTheme = (mode: "light" | "dark" | "system") => {
    let isDark = false;
    if (mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = mode === "dark";
    }

    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  const handleThemeChange = (nextMode: "light" | "dark" | "system") => {
    setThemeMode(nextMode);
    localStorage.setItem("theme_mode", nextMode);
    applyTheme(nextMode);
  };

  const toggleSidebarCollapsed = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_collapsed", String(nextState));
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  useEffect(() => {
    if (mounted) {
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      if (!activeToken) {
        router.replace("/login");
      }
    }
  }, [mounted, token, router]);

  useEffect(() => {
    if (mounted && token && role === "student" && pathname === "/dashboard/teacher") {
      router.push("/dashboard/student");
    }
  }, [mounted, token, role, pathname, router]);

  useEffect(() => {
    const handlePop = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setCurrentTab(hash);
      } else {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab) setCurrentTab(tab);
      }
    };
    handlePop();
    window.addEventListener("hashchange", handlePop);
    window.addEventListener("popstate", handlePop);
    return () => {
      window.removeEventListener("hashchange", handlePop);
      window.removeEventListener("popstate", handlePop);
    };
  }, [pathname]);

  const navToTab = (tab: string) => {
    closeSidebarMobile();
    setCurrentTab(tab);
    if (pathname === "/dashboard/teacher") {
      window.location.hash = tab;
      const el = document.getElementById(tab);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.dispatchEvent(new CustomEvent("switch-tab", { detail: tab }));
    } else {
      router.push(`/dashboard/teacher#${tab}`);
    }
  };

  const isTeacher = role === "teacher" || role === "inst_admin" || role === "super_admin";

  const closeSidebarMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0f19] overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white dark:bg-[#131b2e] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out shadow-sm md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${sidebarCollapsed ? "w-[76px]" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#131b2e]">
          <div className={`flex items-center gap-3 overflow-hidden ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <School className="h-5.5 w-5.5" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight truncate">EduQuizX</h1>
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 rounded uppercase">PRO</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase truncate">Academic Hub</p>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <button 
              onClick={toggleSidebarCollapsed}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collapsed Mode Expand Button */}
        {sidebarCollapsed && (
          <div className="hidden md:flex justify-center pt-2 pb-1 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={toggleSidebarCollapsed}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
          {/* SECTION: CREATOR STUDIO OR STUDENT PORTAL */}
          <div className="space-y-1.5">
            {!sidebarCollapsed ? (
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-3 mb-2 uppercase tracking-widest">
                {pathname === "/dashboard/teacher" ? "Creator Studio" : "Candidate Portal"}
              </div>
            ) : (
              <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto mb-2 rounded" />
            )}

            <div className="space-y-1">
              {pathname === "/dashboard/teacher" ? (
                <>
                  {/* Assessments Tab */}
                  <button 
                    onClick={() => navToTab("exams")}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sidebarCollapsed ? "justify-center px-0" : ""
                    } ${
                      currentTab === "exams"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                        : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <GraduationCap className={`h-4.5 w-4.5 shrink-0 ${currentTab === "exams" ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                    {!sidebarCollapsed && <span>Assessments</span>}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                        Assessments
                      </span>
                    )}
                  </button>

                  {/* Create Quiz Tab */}
                  <button 
                    onClick={() => navToTab("create")}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sidebarCollapsed ? "justify-center px-0" : ""
                    } ${
                      currentTab === "create"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                        : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <FileText className={`h-4.5 w-4.5 shrink-0 ${currentTab === "create" ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                    {!sidebarCollapsed && <span>Create Quiz</span>}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                        Create Quiz Wizard
                      </span>
                    )}
                  </button>

                  {/* Question Bank Tab */}
                  <button 
                    onClick={() => navToTab("bank")}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sidebarCollapsed ? "justify-center px-0" : ""
                    } ${
                      currentTab === "bank"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                        : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Layers className={`h-4.5 w-4.5 shrink-0 ${currentTab === "bank" ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                    {!sidebarCollapsed && <span>Question Bank</span>}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                        Question Bank
                      </span>
                    )}
                  </button>

                  {/* Knowledge Base Tab */}
                  <button 
                    onClick={() => navToTab("kb")}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sidebarCollapsed ? "justify-center px-0" : ""
                    } ${
                      currentTab === "kb"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                        : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <BookOpen className={`h-4.5 w-4.5 shrink-0 ${currentTab === "kb" ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                    {!sidebarCollapsed && <span>Knowledge Base</span>}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                        Knowledge Base (RAG)
                      </span>
                    )}
                  </button>

                  {/* Student Directory Tab */}
                  <button 
                    onClick={() => navToTab("students")}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sidebarCollapsed ? "justify-center px-0" : ""
                    } ${
                      currentTab === "students"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                        : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Users className={`h-4.5 w-4.5 shrink-0 ${currentTab === "students" ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                    {!sidebarCollapsed && <span>Student Roster</span>}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                        Student Directories & Cohorts
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <a
                  href="/dashboard/student"
                  onClick={closeSidebarMobile}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-650 dark:bg-blue-400/15 dark:text-blue-400 border border-blue-500/20 transition-all ${
                    sidebarCollapsed ? "justify-center px-0" : ""
                  }`}
                >
                  <UserCheck className="h-4.5 w-4.5 shrink-0" />
                  {!sidebarCollapsed && <span>Student Portal</span>}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                      Student Exam Portal
                    </span>
                  )}
                </a>
              )}
            </div>
          </div>

          {/* SECTION: ANALYTICS (Creator Mode Only) */}
          {pathname === "/dashboard/teacher" && (
            <div className="space-y-1.5">
              {!sidebarCollapsed ? (
                <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-3 mb-2 uppercase tracking-widest">
                  Analytics & Reports
                </div>
              ) : (
                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto mb-2 rounded" />
              )}
              
              <div className="space-y-1">
                <button 
                  onClick={() => navToTab("reports")}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sidebarCollapsed ? "justify-center px-0" : ""
                  } ${
                    currentTab === "reports"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                      : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <BarChart2 className={`h-4.5 w-4.5 shrink-0 ${currentTab === "reports" ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                  {!sidebarCollapsed && <span>Gradebook Analytics</span>}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                      Results & Gradebook Analytics
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SECTION: SYSTEM & PREFERENCES */}
          <div className="space-y-1.5">
            {!sidebarCollapsed ? (
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-3 mb-2 uppercase tracking-widest">
                System
              </div>
            ) : (
              <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto mb-2 rounded" />
            )}

            <div className="space-y-1">
              <button 
                onClick={() => { closeSidebarMobile(); setSettingsModalOpen(true); }}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer ${
                  sidebarCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <Sliders className="h-4.5 w-4.5 shrink-0 text-slate-400 group-hover:text-blue-600" />
                {!sidebarCollapsed && <span>Settings & Profile</span>}
                {sidebarCollapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                    System & Profile Settings
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SECTION: DEVELOPER TOOLS */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setDevToolsOpen(!devToolsOpen)} 
              className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                sidebarCollapsed ? "justify-center px-0" : ""
              }`}
              title="Developer Tools"
            >
              {!sidebarCollapsed ? (
                <>
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Developer Sandbox</span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${devToolsOpen ? "rotate-180" : ""}`} />
                </>
              ) : (
                <div className="group relative">
                  <Layers className="h-4 w-4" />
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                    Developer Tools
                  </span>
                </div>
              )}
            </button>

            {devToolsOpen && !sidebarCollapsed && (
              <div className="mt-1.5 space-y-1 pl-4 border-l border-slate-200 dark:border-slate-800 ml-3 text-[10px]">
                <a 
                  href={`${API_BASE}/static/index.html`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 rounded transition-colors"
                >
                  <span>Static Creator UI</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href={`${API_BASE}/static/exam.html`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 rounded transition-colors"
                >
                  <span>Candidate Sandbox</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href={`${API_BASE}/docs`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 rounded transition-colors"
                >
                  <span>FastAPI Swagger Docs</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* BOTTOM PROFILE & LOGOUT CARD */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1424] shrink-0">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "flex-col justify-center" : "justify-between"}`}>
            <div className={`flex items-center gap-2.5 overflow-hidden ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div 
                className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0 cursor-pointer"
                title={fullName || "User Account"}
              >
                {fullName ? fullName.charAt(0).toUpperCase() : "U"}
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {fullName || "Instructor"}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase truncate">
                    {role || "user"} · EduQuizX
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => { logout(); router.push("/login"); }}
              className={`p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
                sidebarCollapsed ? "mt-1.5" : ""
              }`}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA & TOPBAR */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top App Navigation Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm transition-colors duration-300">
          
          {/* Left Breadcrumb & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold">EduQuizX</span>
              <span>/</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {pathname === "/dashboard/teacher" ? "Quiz Creator Studio" : "Student Portal"}
              </span>
              <a 
                href="/" 
                className="ml-2 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-650 dark:bg-blue-450/15 dark:text-blue-400 hover:bg-blue-600/20 text-xs font-bold transition-all border border-blue-500/20"
                title="Switch Workspace Mode"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Switch Mode</span>
              </a>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search assessments, candidate cohorts, questions..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Action Menu: Help, Notifications, Theme Toggle */}
          <div className="flex items-center gap-3">
            <a 
              href="/guide"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors"
              title="Documentation Guide"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </a>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer" 
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4.5 w-4.5 rounded-full bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-md">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {notifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                        <span>No new notifications</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 text-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start justify-between gap-3 ${
                            !n.is_read ? "bg-blue-500/5 dark:bg-blue-400/5 font-semibold" : ""
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                              <span className="text-[10px] text-slate-550 dark:text-slate-500">
                                {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">{n.message}</p>
                            {n.link && (
                              <a 
                                href={n.link}
                                onClick={() => { markRead(n.id); setNotifOpen(false); }}
                                className="inline-flex items-center gap-1 text-[11px] text-blue-650 hover:underline font-bold mt-1.5"
                              >
                                View details &rarr;
                              </a>
                            )}
                          </div>
                          {!n.is_read && (
                            <button 
                              onClick={() => markRead(n.id)}
                              className="h-2 w-2 rounded-full bg-blue-600 hover:scale-125 transition-all shrink-0 mt-1.5 cursor-pointer"
                              title="Mark read"
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle (Light / Dark / System) */}
            <div className="flex items-center bg-slate-50 dark:bg-[#0b0f19] p-1 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-800">
              <button 
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  themeMode === "light" 
                    ? "bg-white text-slate-905 shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Light Mode"
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button 
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  themeMode === "dark" 
                    ? "bg-[#1e293b] text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
                title="Dark Mode"
              >
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </button>
              <button 
                type="button"
                onClick={() => handleThemeChange("system")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  themeMode === "system" 
                    ? "bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="System Theme"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">System</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0b0f19]">
          {children}
        </main>
      </div>

      {/* SETTINGS MODAL */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-202 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 rounded-xl border border-blue-500/20">
                  <Sliders className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">System & Profile Settings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Workspace and account preferences</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-white">{fullName || "Instructor"}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Role: <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{role || "User"}</span></div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Institution: EduQuizX Academy</div>
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-slate-650 dark:text-slate-400 uppercase tracking-wider text-[10px]">Theme Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleThemeChange(mode)}
                      className={`p-2.5 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                        themeMode === mode
                          ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:bg-blue-400/15 dark:border-blue-400 dark:text-blue-400 shadow-xs"
                          : "border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="px-4 py-2.5 rounded-xl text-rose-600 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold cursor-pointer transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
