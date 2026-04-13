import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import PasswordStrength from "@/components/PasswordStrength";

export default function RegisterPage() {
  const { t } = useLanguage();
  const a = t.auth;
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get("returnTo") || "/";
  const prefillEmail = params.get("email") || "";

  // Pre-fill email from invite
  useState(() => {
    if (prefillEmail) setEmail(prefillEmail);
  });

  if (user) {
    setLocation(returnTo);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(a.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(a.passwordTooShort);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || a.registerError);
        return;
      }

      window.location.href = returnTo;
    } catch {
      setError(a.registerError);
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

      {/* Right: Register Form */}
      <div className="w-full lg:w-1/2 bg-[#0F1B2D] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-[Cormorant] font-bold text-[#C8A951]">
              P.A.G.O.
            </h1>
            <p className="text-sm text-[#FAFAF8]/50 font-[Montserrat]">
              {a.registerSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A8A]" />
              <input
                type="text"
                className={inputClass}
                placeholder={a.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>

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
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A6A8A] hover:text-[#B8A88A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <PasswordStrength password={password} />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A8A]" />
              <input
                type={showPassword ? "text" : "password"}
                className={inputClass}
                placeholder={a.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 font-[Montserrat] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name || !email || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#D4C8A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? a.registering : a.registerButton}
            </button>
          </form>

          <p className="text-center text-sm text-[#FAFAF8]/50 font-[Montserrat]">
            {a.hasAccount}{" "}
            <button
              onClick={() => setLocation(`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)}
              className="text-[#B8A88A] hover:text-[#D4C8A8] font-semibold transition-colors"
            >
              {a.loginLink}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
