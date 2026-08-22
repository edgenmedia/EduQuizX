"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ShieldCheck, Mail, ArrowRight, School, Sparkles } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

function VerifyStudentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copiedPwd, setCopiedPwd] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMessage("No verification token provided in link.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await apiFetch(`/auth/verify-student?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
          setVerifiedEmail(data.email);
          setVerifiedName(data.full_name);
          if (data.generated_password) {
            setGeneratedPassword(data.generated_password);
          }
        } else {
          setErrorMessage(data.detail || "Invalid or expired verification link.");
        }
      } catch {
        setErrorMessage("Network error verifying student account.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopiedPwd(true);
      setTimeout(() => setCopiedPwd(false), 2000);
    }
  };

  const handleGoogleAuthorize = async () => {
    setLoading(true);
    try {
      const emailToAuth = verifiedEmail || prompt("Enter your Google Account email to authorize:", "student@aegeus.edu");
      if (!emailToAuth) {
        setLoading(false);
        return;
      }

      const res = await apiFetch("/auth/google-authorize", {
        method: "POST",
        body: JSON.stringify({
          email: emailToAuth,
          name: verifiedName || "Verified Student",
          google_id: `google_${Date.now()}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAuth(data.access_token, data.role, data.full_name);
        router.push("/dashboard/student");
      } else {
        setErrorMessage(data.detail || "Failed to authorize with Google.");
      }
    } catch {
      setErrorMessage("Google authorization network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-12 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
        
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
            <School className="h-5.5 w-5.5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">EduQuizX</span>
        </div>

        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Authorizing Student Profile...</h2>
          </div>
        ) : success ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-250 dark:border-emerald-800/40 shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Authorized!</h2>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Welcome <b className="text-slate-950 dark:text-white font-bold">{verifiedName}</b> ({verifiedEmail}). Your student profile is verified.
              </p>
            </div>

            {/* Notice Card */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3.5">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Mail className="h-4 w-4 text-blue-650" />
                <span>Generated Password & Credentials</span>
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                A secure portal access password has been generated and sent to your email inbox (<b>{verifiedEmail}</b>).
              </p>

              {generatedPassword && (
                <div className="bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-1.5 shadow-xs">
                  <div className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Your Student Portal Password:</div>
                  <div className="flex items-center justify-between font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    <span>{generatedPassword}</span>
                    <button
                      onClick={copyPassword}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all font-sans cursor-pointer"
                    >
                      {copiedPwd ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => router.push("/login")}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <span>Sign in with Password</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleGoogleAuthorize}
                className="w-full py-3 px-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/40">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verification Link Expired</h2>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                {errorMessage || "This authorization link is invalid or has already been used."}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleGoogleAuthorize}
                className="w-full py-3 px-4 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Authorize Directly with Google</span>
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyStudentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f19] text-xs font-bold text-slate-500">
        Loading verification...
      </div>
    }>
      <VerifyStudentContent />
    </Suspense>
  );
}
