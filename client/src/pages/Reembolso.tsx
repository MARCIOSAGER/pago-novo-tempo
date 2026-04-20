import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REFUND_WINDOW_DAYS = 7;

function getQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatBrl(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function Reembolso() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const sessionId = getQueryParam("session_id");
  const copy = t.diagnostico.refund;

  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: purchase, isLoading, error } = trpc.purchases.lookupBySession.useQuery(
    { sessionId: sessionId || "", email: emailConfirmed ? email.trim().toLowerCase() : undefined },
    { enabled: Boolean(sessionId), retry: false }
  );

  const request = trpc.purchases.requestRefund.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setErrorMsg(null);
    },
    onError: (e) => {
      setErrorMsg(e.message);
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const handleEmailConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length < 5 || !email.includes("@")) {
      setErrorMsg("Email inválido");
      return;
    }
    setErrorMsg(null);
    setEmailConfirmed(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    if (reason.trim().length < 5) {
      setErrorMsg(copy.reasonHelp);
      return;
    }
    request.mutate({ sessionId, email: email.trim().toLowerCase(), reason: reason.trim() });
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString(language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const productLabels: Record<string, string> = {
    ebook: "Ebook P.A.G.O.",
    kit: "Kit P.A.G.O.",
    mentoria: "Mentoria P.A.G.O.",
  };

  const daysElapsed = purchase
    ? Math.floor((Date.now() - new Date(purchase.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const daysLeft = Math.max(0, REFUND_WINDOW_DAYS - daysElapsed);
  const isExpired = daysLeft === 0;
  const alreadyRefunded = purchase?.status === "refunded";
  const alreadyAbandoned = purchase?.status === "abandoned";
  const pendingRequest = Boolean(purchase?.refundRequestedAt && !purchase?.refundDeniedAt);
  const previouslyDenied = Boolean(purchase?.refundDeniedAt);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-4">
                P.A.G.O.
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-semibold text-navy leading-tight mb-3">
                {copy.title}
              </h1>
              <div className="w-12 h-[1px] bg-gold mx-auto mb-4" />
              <p className="font-body text-sm text-navy/70 max-w-md mx-auto">{copy.subtitle}</p>
            </div>

            {/* No session_id in URL */}
            {!sessionId && (
              <InfoBox icon={AlertCircle} variant="warning" message={copy.noSessionId} />
            )}

            {/* Email confirmation step — required before showing any PII */}
            {sessionId && !emailConfirmed && !submitted && (
              <form onSubmit={handleEmailConfirm} className="space-y-4 border border-navy/10 bg-white p-6">
                <div>
                  <Label htmlFor="email" className="font-accent text-xs uppercase tracking-[0.15em] text-navy mb-2 block">
                    Email usado na compra
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    maxLength={320}
                  />
                  <p className="text-xs text-navy/50 mt-1.5">
                    Digite o mesmo email que usou na compra para verificarmos sua identidade.
                  </p>
                </div>
                {errorMsg && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                    {errorMsg}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-3 hover:bg-navy-dark transition-colors"
                >
                  Continuar
                </button>
              </form>
            )}

            {/* Loading (after email confirmed) */}
            {sessionId && emailConfirmed && isLoading && (
              <InfoBox icon={Clock} variant="neutral" message={copy.loading} />
            )}

            {/* Lookup failed (generic message — does not reveal if session_id or email is wrong) */}
            {sessionId && emailConfirmed && !isLoading && error && (
              <div className="space-y-3">
                <InfoBox icon={AlertCircle} variant="warning" message={copy.notFound} />
                <button
                  type="button"
                  onClick={() => { setEmailConfirmed(false); setEmail(""); }}
                  className="text-xs text-navy/60 hover:text-navy underline"
                >
                  Tentar com outro email
                </button>
              </div>
            )}

            {/* Success */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-emerald-200 bg-emerald-50 rounded p-8 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" strokeWidth={1.5} />
                <h2 className="font-display text-xl font-semibold text-navy mb-3">
                  {copy.successTitle}
                </h2>
                <p className="font-body text-sm text-navy/70 mb-6 max-w-md mx-auto">
                  {copy.successMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-3 hover:bg-navy-dark transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {copy.backHome}
                </button>
              </motion.div>
            )}

            {/* Purchase info + form — only render after email confirmation */}
            {purchase && emailConfirmed && !submitted && (
              <div className="space-y-6">
                {/* Purchase summary card */}
                <div className="border border-navy/10 bg-white p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-navy/50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-navy/50 mb-1">
                        {copy.product}
                      </p>
                      <p className="font-display text-base text-navy">
                        {productLabels[purchase.productSlug] || purchase.productSlug}
                        {purchase.language && (
                          <span className="ml-2 font-mono text-xs uppercase bg-muted px-1.5 py-0.5 border">
                            {purchase.language}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-navy/5">
                    <div>
                      <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-navy/50 mb-1">
                        {copy.amount}
                      </p>
                      <p className="font-body text-sm text-navy font-semibold">
                        {formatBrl(purchase.amountCents, purchase.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-navy/50 mb-1">
                        {copy.purchaseDate}
                      </p>
                      <p className="font-body text-sm text-navy">
                        {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status messages */}
                {alreadyAbandoned ? (
                  <InfoBox icon={AlertCircle} variant="warning" message={copy.abandoned} />
                ) : alreadyRefunded ? (
                  <InfoBox icon={CheckCircle2} variant="success" message={copy.alreadyRefunded} />
                ) : pendingRequest ? (
                  <InfoBox
                    icon={Clock}
                    variant="info"
                    message={copy.alreadyRequested.replace(
                      "{date}",
                      purchase.refundRequestedAt ? formatDate(purchase.refundRequestedAt) : ""
                    )}
                  />
                ) : isExpired ? (
                  <InfoBox icon={AlertCircle} variant="warning" message={copy.expired} />
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-navy/70">
                      <Clock className="h-4 w-4" />
                      <span>{copy.daysLeft.replace("{days}", String(daysLeft))}</span>
                    </div>

                    {previouslyDenied && purchase.refundDeniedAt && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                        {copy.previouslyDenied.replace("{note}", "")}
                      </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="reason" className="font-accent text-xs uppercase tracking-[0.15em] text-navy mb-2 block">
                          {copy.reasonLabel}
                        </Label>
                        <Textarea
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder={copy.reasonPlaceholder}
                          rows={5}
                          maxLength={2000}
                          className="bg-white"
                          required
                          minLength={5}
                        />
                        <p className="text-xs text-navy/50 mt-1.5">
                          {reason.length}/2000 · {copy.reasonHelp}
                        </p>
                      </div>

                      {errorMsg && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                          {errorMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={request.isPending || reason.trim().length < 5}
                        className="w-full btn-shine font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-4 hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {request.isPending ? copy.submitting : copy.submit}
                      </button>
                    </form>
                  </>
                )}

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setLocation("/")}
                    className="font-accent text-xs uppercase tracking-[0.15em] text-navy/60 hover:text-navy transition-colors inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    {copy.backHome}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface InfoBoxProps {
  icon: React.ElementType;
  variant: "neutral" | "info" | "success" | "warning";
  message: string;
}

function InfoBox({ icon: Icon, variant, message }: InfoBoxProps) {
  const variants = {
    neutral: "border-navy/10 bg-white text-navy/70",
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <div className={`border ${variants[variant]} rounded p-5 flex items-start gap-3`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}
