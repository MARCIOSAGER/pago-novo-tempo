import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getGoogleLoginUrl, getGithubLoginUrl } from "@/const";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const a = t.auth;
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get returnTo from URL params
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get("returnTo") || "/";

  // Redirect if already logged in
  if (user) {
    setLocation(returnTo);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || a.loginError);
        return;
      }

      window.location.href = returnTo;
    } catch {
      setError(a.loginError);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0D1520] border border-[#2A3A5C] rounded-lg pl-11 pr-4 py-3 text-[#FAFAF8] placeholder:text-[#5A6A8A] font-[Montserrat] text-sm focus:outline-none focus:border-[#B8A88A] transition-colors";

  return (
    <div className="min-h-screen flex">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/PAGO_Arvore_Corp.png"
          alt="P.A.G.O. Corporativo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F1B2D]/80" />
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 bg-[#0F1B2D] flex items-center justify-center p-6 sm:p-8 min-h-screen">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-[Cormorant] font-bold text-[#C8A951]">
              P.A.G.O.
            </h1>
            <p className="text-sm text-[#FAFAF8]/50 font-[Montserrat]">
              {a.loginSubtitle}
            </p>
          </div>

          {/* Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A8A]" />
              <input
                type="email"
                className={inputClass}
                placeholder={a.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A8A]" />
              <input
                type={showPassword ? "text" : "password"}
                className={inputClass}
                placeholder={a.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A6A8A] hover:text-[#B8A88A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setLocation("/forgot-password")}
                className="text-xs text-[#B8A88A] hover:text-[#D4C8A8] font-[Montserrat] transition-colors"
              >
                {a.forgotPassword}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-400 font-[Montserrat] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#D4C8A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? a.loggingIn : a.loginButton}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#2A3A5C]" />
            <span className="text-xs text-[#5A6A8A] font-[Montserrat] uppercase tracking-wider">{a.or}</span>
            <div className="flex-1 h-px bg-[#2A3A5C]" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <a
              href={getGoogleLoginUrl(returnTo)}
              className="w-full flex items-center justify-center gap-3 bg-white/10 border border-[#2A3A5C] text-[#FAFAF8] font-[Montserrat] font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/15 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {a.continueGoogle}
            </a>

            <a
              href={getGithubLoginUrl(returnTo)}
              className="w-full flex items-center justify-center gap-3 bg-white/10 border border-[#2A3A5C] text-[#FAFAF8] font-[Montserrat] font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/15 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {a.continueGithub}
            </a>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-[#FAFAF8]/50 font-[Montserrat]">
            {a.noAccount}{" "}
            <button
              onClick={() => setLocation(`/register${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)}
              className="text-[#B8A88A] hover:text-[#D4C8A8] font-semibold transition-colors"
            >
              {a.createAccount}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
