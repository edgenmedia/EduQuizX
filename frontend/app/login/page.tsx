"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  School, 
  Sun, 
  Moon, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  KeyRound, 
  X,
  FileCode2,
  BookOpen
} from "lucide-react";

import Script from "next/script";
import { apiFetch } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [gisLoaded, setGisLoaded] = useState(false);

  // Auth Mode: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regRole, setRegRole] = useState<"teacher" | "student">("teacher");

  // Direct Exam Code Fast Gateway
  const [examCodeInput, setExamCodeInput] = useState("");
  const [showExamCodeGateway, setShowExamCodeGateway] = useState(false);

  // Target destination query parameter
  const [targetDestination, setTargetDestination] = useState<string | null>(null);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const resolveDestination = (userRole: string) => {
    if (targetDestination) {
      if (targetDestination === "teacher_dashboard") return "/dashboard/teacher";
      if (targetDestination === "student_dashboard") return "/dashboard/student";
      if (targetDestination.startsWith("/")) return targetDestination;
    }
    if (userRole === "student") return "/dashboard/student";
    return "/dashboard/teacher";
  };

  useEffect(() => {
    // Check URL query parameters for initial mode, role, and target
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup" || window.location.pathname === "/register") {
        setAuthMode("signup");
      }
      const roleParam = params.get("role");
      if (roleParam === "student") {
        setRegRole("student");
      } else if (roleParam === "teacher") {
        setRegRole("teacher");
      }
      const targetParam = params.get("target");
      if (targetParam) {
        setTargetDestination(targetParam);
      }
    }

    // Load saved preferences
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    const savedEmail = localStorage.getItem("eduquiz_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          token: response.credential,
          role: regRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Google authentication failed");
      }

      if (data.workspace_id) {
        localStorage.setItem("workspaceId", data.workspace_id);
        localStorage.setItem("workspaceName", data.workspace_name || "Personal Workspace");
      }

      setAuth(data.access_token, data.role, data.full_name);
      router.push(resolveDestination(data.role));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initGoogleGIS = () => {
    setGisLoaded(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "716730043675-rq3tq97avgrrbtjoup3hjdhteg4k7pql.apps.googleusercontent.com";
    if (clientId && clientId.trim()) {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId.trim(),
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          const btnContainer = document.getElementById("google-signin-btn-container");
          if (btnContainer) {
            btnContainer.innerHTML = "";
            (window as any).google.accounts.id.renderButton(btnContainer, {
              theme: theme === "dark" ? "filled_black" : "outline",
              size: "large",
              width: 380,
              text: authMode === "signup" ? "signup_with" : "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
            });
          }
          // Optional One-Tap prompt
          try {
            (window as any).google.accounts.id.prompt();
          } catch {}
        } catch (err) {
          console.warn("GIS button initialization notice:", err);
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      initGoogleGIS();
    }
  }, [theme, gisLoaded, authMode]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("eduquiz_remember_email", email);
      } else {
        localStorage.removeItem("eduquiz_remember_email");
      }

      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Incorrect email or password");
      }

      if (data.workspace_id) {
        localStorage.setItem("workspaceId", data.workspace_id);
        localStorage.setItem("workspaceName", data.workspace_name || "Personal Workspace");
      }

      setAuth(data.access_token, data.role, data.full_name);
      router.push(resolveDestination(data.role));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regFullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!regEmail.trim()) {
      setError("Please enter a valid email address");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: regFullName.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
          role: regRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Account creation failed");
      }

      if (data.workspace_id) {
        localStorage.setItem("workspaceId", data.workspace_id);
        localStorage.setItem("workspaceName", data.workspace_name || "Personal Workspace");
      }

      setAuth(data.access_token, data.role, data.full_name);
      router.push(resolveDestination(data.role));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectExamJump = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examCodeInput.trim()) return;
    const cleanCode = examCodeInput.trim().replace(/^.*\/exam\//, "");
    router.push(`/exam/${cleanCode}`);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);
    setForgotLoading(true);

    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to process password reset request");
      }
      setForgotMessage(data.message || "Reset link dispatched! Please check your email inbox.");
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, text: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, text: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, text: "Good", color: "bg-blue-500" };
    return { score: 4, text: "Strong", color: "bg-emerald-500" };
  };

  const pwdStrength = getPasswordStrength(regPassword);

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0b0f19] px-4 py-10 sm:py-16 transition-colors duration-300">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleGIS}
      />
      
      {/* Subtle Ambient Decorative Circles */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Options: Guide Link & Theme Toggle */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <a 
          href="/guide"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#131b2e]/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 backdrop-blur-md shadow-xs transition-all"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>← View Platform Usage Guide</span>
        </a>

        <button
          onClick={toggleTheme}
          className="w-12 h-7 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 flex items-center cursor-pointer transition-colors duration-300 relative focus:outline-none"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
          aria-label="Toggle Theme"
        >
          <div
            className={`w-6 h-6 rounded-full bg-white dark:bg-blue-600 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
              theme === "dark" ? "translate-x-5 text-white" : "translate-x-0 text-amber-500"
            }`}
          >
            {theme === "light" ? <Sun className="h-3.5 w-3.5" style={{ color: '#d97706' }} /> : <Moon className="h-3.5 w-3.5" />}
          </div>
        </button>
      </div>

      <div className="w-full max-w-[460px] z-10 space-y-6 mt-8">
        
        {/* Logo & Platform Headline */}
        <div className="flex justify-center items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <School className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">EduQuizX</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide mt-1.5 uppercase">Autonomous Examination Portal</p>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
          
          {/* Auth Mode Toggle Pill: Sign In vs Create Account */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {authMode === "signin" ? "Welcome Back" : "Create New Account"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
              {authMode === "signin" 
                ? "Sign in to access your assessment workspace and analytics." 
                : "Get started with your personalized quiz creation and proctoring workspace."}
            </p>
          </div>

          {error && (
            <div className="flex gap-2.5 items-center p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                  Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@aegeus.edu"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotMessage(null);
                      setForgotError(null);
                      setForgotModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/30 cursor-pointer h-4 w-4"
                  />
                  <span>Remember my email</span>
                </label>
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 text-xs transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In to Portal"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            /* CREATE ACCOUNT (SIGN UP) FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection Tabs */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                  I am registering as a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole("teacher")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      regRole === "teacher"
                        ? "bg-blue-500/10 dark:bg-blue-400/10 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <div className="font-extrabold text-xs">
                      🎓 Educator
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5">Author quizzes & review gradebooks</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("student")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      regRole === "student"
                        ? "bg-blue-500/10 dark:bg-blue-400/10 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <div className="font-extrabold text-xs">
                      🎒 Student
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5">Attempt tests & track results</div>
                  </button>
                </div>
              </div>

              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sarah@university.edu"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Field with Strength Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                    Create Password
                  </label>
                  {regPassword && (
                    <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                      Strength: <span className="font-bold">{pwdStrength.text}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={regShowPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {regShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength Meter Bar */}
                {regPassword && (
                  <div className="grid grid-cols-4 gap-1 pt-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 rounded-full transition-all ${
                          step <= pwdStrength.score ? pwdStrength.color : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={regShowPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                  <KeyRound className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Sign Up Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 text-xs transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account & Get Started"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-[#131b2e] px-3 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider shrink-0">
              or {authMode === "signup" ? "sign up with" : "continue with"}
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Google Identity Services Container */}
          <div className="w-full flex justify-center min-h-[44px]">
            <div id="google-signin-btn-container" className="w-full flex justify-center min-h-[44px]" />
          </div>

          {/* Bottom Switcher: Sign In vs Create Account */}
          <div className="text-center text-xs text-slate-550 dark:text-slate-400 pt-1">
            {authMode === "signin" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setError(null);
                  }}
                  className="font-bold text-blue-650 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Create one now →
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setError(null);
                  }}
                  className="font-bold text-blue-650 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Sign in here →
                </button>
              </p>
            )}
          </div>

          {/* Direct Exam Code Gateway Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {!showExamCodeGateway ? (
              <button
                type="button"
                onClick={() => setShowExamCodeGateway(true)}
                className="w-full text-center text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-blue-650 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Taking a Test? Enter Exam Code</span>
              </button>
            ) : (
              <form onSubmit={handleDirectExamJump} className="space-y-2.5 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Candidate Direct Access</span>
                  <button
                    type="button"
                    onClick={() => setShowExamCodeGateway(false)}
                    className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={examCodeInput}
                    onChange={(e) => setExamCodeInput(e.target.value)}
                    placeholder="e.g. ex-com-1234"
                    className="flex-1 bg-white dark:bg-[#131b2e] border border-slate-205 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shrink-0 cursor-pointer"
                  >
                    Take Exam
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Footer Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-slate-450 dark:text-slate-500 text-xs">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
          <span>Secured with Aegis Multi-factor & Anti-cheat Telemetry</span>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 flex items-center justify-center font-bold">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Password Recovery</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive a recovery link via email</p>
              </div>
            </div>

            {forgotMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800/40 text-emerald-855 dark:text-emerald-450 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-650 shrink-0" />
                  <span>Recovery Dispatched</span>
                </div>
                <p>{forgotMessage}</p>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="mt-2 w-full py-2 bg-emerald-650 text-white rounded-lg font-bold text-xs hover:bg-emerald-700"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {forgotError}
                  </div>
                )}
                
                <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed">
                  Enter your registered student or educator email address below. We will send you a password recovery link shortly.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. teacher@aegeus.edu"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {forgotLoading ? "Dispatching..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
