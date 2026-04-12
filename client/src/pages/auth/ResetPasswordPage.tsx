import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Loader2, Lock, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const a = t.auth;
  const [, params] = useRoute("/reset-password/:token");
  const [, setLocation] = useLocation();
  const token = params?.token ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || a.resetError);
        return;
      }

      setSuccess(true);
    } catch {
      setError(a.resetError);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0D1520] border border-[#2A3A5C] rounded-lg pl-11 pr-4 py-3 text-[#FAFAF8] placeholder:text-[#5A6A8A] font-[Montserrat] text-sm focus:outline-none focus:border-[#B8A88A] transition-colors";

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/PAGO_Arvore_Corp.png"
          alt="P.A.G.O. Corporativo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F1B2D]/80" />
      </div>

      <div className="w-full lg:w-1/2 bg-[#0F1B2D] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-[Cormorant] font-bold text-[#C8A951]">
              P.A.G.O.
            </h1>
            <p className="text-sm text-[#FAFAF8]/50 font-[Montserrat]">
              {a.resetSubtitle}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center py-6 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2E8B6A]/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#2E8B6A]" />
              </div>
              <h3 className="text-xl font-[Cormorant] font-bold text-[#FAFAF8]">
                {a.resetSuccessTitle}
              </h3>
              <p className="text-sm text-[#FAFAF8]/60 font-[Montserrat] max-w-sm">
                {a.resetSuccessMessage}
              </p>
              <button
                onClick={() => setLocation("/login")}
                className="mt-4 px-6 py-2.5 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm rounded-lg hover:bg-[#D4C8A8] transition-colors"
              >
                {a.goToLogin}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A8A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  className={inputClass}
                  placeholder={a.newPasswordPlaceholder}
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

              <p className="text-xs text-[#5A6A8A] font-[Montserrat]">{a.passwordRequirement}</p>

              {error && (
                <p className="text-sm text-red-400 font-[Montserrat] text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#D4C8A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? a.resetting : a.resetButton}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
