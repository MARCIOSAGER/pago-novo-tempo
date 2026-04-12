import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const a = t.auth;
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || a.forgotError);
        return;
      }

      setSent(true);
    } catch {
      setError(a.forgotError);
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
              {a.forgotSubtitle}
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center py-6 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2E8B6A]/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#2E8B6A]" />
              </div>
              <h3 className="text-xl font-[Cormorant] font-bold text-[#FAFAF8]">
                {a.forgotSuccessTitle}
              </h3>
              <p className="text-sm text-[#FAFAF8]/60 font-[Montserrat] max-w-sm">
                {a.forgotSuccessMessage}
              </p>
              <button
                onClick={() => setLocation("/login")}
                className="mt-4 px-6 py-2.5 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm rounded-lg hover:bg-[#D4C8A8] transition-colors"
              >
                {a.backToLogin}
              </button>
            </div>
          ) : (
            <>
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

                {error && (
                  <p className="text-sm text-red-400 font-[Montserrat] text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#D4C8A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? a.sending : a.sendResetLink}
                </button>
              </form>

              <button
                onClick={() => setLocation("/login")}
                className="w-full flex items-center justify-center gap-2 text-sm text-[#FAFAF8]/50 hover:text-[#B8A88A] font-[Montserrat] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {a.backToLogin}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
