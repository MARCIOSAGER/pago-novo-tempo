import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import DiagnosticoRadarChart from "./DiagnosticoRadarChart";
import DiagnosticoPillarCard from "./DiagnosticoPillarCard";
import { getStatusInfo } from "./useDiagnosticoReducer";
import type { PillarKey } from "./useDiagnosticoReducer";

interface DiagnosticoResultsProps {
  nome: string;
  pillarAverages: Record<PillarKey, number>;
  overallAverage: number;
  weakestPillar: PillarKey;
  chartData: { pillar: string; value: number; fullMark: number }[];
  answers: Record<PillarKey, number[]>;
  onRestart: () => void;
  emotionalAverage: number;
}

const PILLAR_ORDER: PillarKey[] = ["P", "A", "G", "O"];

export default function DiagnosticoResults({
  nome,
  pillarAverages,
  overallAverage,
  weakestPillar,
  chartData,
  answers,
  onRestart,
  emotionalAverage,
}: DiagnosticoResultsProps) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const submittedRef = useRef(false);

  const overallStatus = getStatusInfo(overallAverage);
  const overallStatusLabel = t.diagnostico.results.status[overallStatus.key];
  const weakestData = t.diagnostico.pillars[weakestPillar];
  const weakestAdvice = t.diagnostico.results.pillarAdvice[weakestPillar];

  const submitMutation = trpc.diagnostico.submit.useMutation();

  // Auto-submit results to backend (fire-and-forget, no email)
  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    submitMutation.mutate({
      nome,
      answersP: answers.P,
      answersA: answers.A,
      answersG: answers.G,
      answersO: answers.O,
      mediaP: pillarAverages.P,
      mediaA: pillarAverages.A,
      mediaG: pillarAverages.G,
      mediaO: pillarAverages.O,
      mediaGeral: overallAverage,
      pilarMaisFraco: weakestPillar,
      sendEmail: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendEmail = () => {
    if (!email || !email.includes("@")) {
      toast.error(t.diagnostico.results.emailInvalid);
      return;
    }

    submitMutation.mutate(
      {
        nome,
        email,
        answersP: answers.P,
        answersA: answers.A,
        answersG: answers.G,
        answersO: answers.O,
        mediaP: pillarAverages.P,
        mediaA: pillarAverages.A,
        mediaG: pillarAverages.G,
        mediaO: pillarAverages.O,
        mediaGeral: overallAverage,
        pilarMaisFraco: weakestPillar,
        sendEmail: true,
      },
      {
        onSuccess: () => {
          setEmailSent(true);
          toast.success(t.diagnostico.results.emailSent);
        },
        onError: () => {
          toast.error(t.diagnostico.results.emailError);
        },
      }
    );
  };

  return (
    <div className="print-friendly">
      {/* Section 1 — Greeting + Overall Score */}
      <section className="bg-navy-dark py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              {t.diagnostico.results.label}
            </p>

            <h2 className="font-display text-3xl lg:text-5xl font-semibold text-warm-white leading-[1.1] mb-2">
              {t.diagnostico.results.greeting} {nome}.
            </h2>
            <p className="font-display text-xl lg:text-2xl text-gold italic mb-8">
              {t.diagnostico.results.subtitle}
            </p>

            <div className="w-12 h-[1px] bg-gold mx-auto mb-10" />

            {/* Overall score */}
            <div className="mb-4">
              <span className="font-display text-7xl lg:text-8xl font-semibold text-warm-white">
                {overallAverage.toFixed(1)}
              </span>
            </div>
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-warm-white/50 mb-4">
              {t.diagnostico.results.overallLabel}
            </p>
            <span
              className="inline-block font-accent text-[10px] uppercase tracking-[0.2em] px-4 py-2 border"
              style={{ borderColor: overallStatus.color, color: overallStatus.color }}
            >
              {overallStatusLabel}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Section 2 — Pillar Cards */}
      <section className="bg-navy py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            {PILLAR_ORDER.map((pillar, i) => (
              <DiagnosticoPillarCard
                key={pillar}
                pillar={pillar}
                average={pillarAverages[pillar]}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Radar Chart */}
      <section className="bg-navy-dark py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <DiagnosticoRadarChart data={chartData} />
        </div>
      </section>

      {/* Section 4 — Weakest Pillar Analysis */}
      <section className="bg-navy py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-8">
              {t.diagnostico.results.weakestLabel}
            </p>

            <span className="font-display text-7xl lg:text-8xl font-semibold text-gold">
              {weakestData.letter}
            </span>
            <h3 className="font-display text-3xl lg:text-4xl font-semibold text-warm-white mt-2 mb-8">
              {weakestData.name}
            </h3>

            <p className="font-body text-base text-warm-white/70 leading-relaxed max-w-2xl mx-auto mb-8">
              {weakestAdvice.text}
            </p>

            <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />

            <p className="font-body text-sm text-gold-light italic">
              {weakestAdvice.verse}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 4.5 — Emotional Alert (conditional) */}
      {pillarAverages.G < 5.5 && emotionalAverage < 4.0 && (
        <section className="bg-navy-dark py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
                {t.diagnostico.emotionalAlert.label}
              </p>

              <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />

              <p className="font-body text-base text-warm-white/70 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
                {t.diagnostico.emotionalAlert.text}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Section 5 — Email + CTA */}
      <section className="bg-navy-dark py-16 lg:py-24 no-print">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          {/* Email send section */}
          {!emailSent ? (
            <div className="max-w-md mx-auto mb-16">
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-4">
                {t.diagnostico.results.emailLabel}
              </p>
              <p className="font-body text-sm text-warm-white/50 mb-6">
                {t.diagnostico.results.emailDescription}
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.diagnostico.results.emailPlaceholder}
                  className="flex-1 bg-transparent border border-warm-white/20 text-warm-white px-4 py-3 font-body text-sm placeholder:text-warm-white/30 focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={submitMutation.isPending}
                  className="font-accent text-xs uppercase tracking-[0.15em] bg-gold text-navy px-6 py-3 hover:bg-gold-light transition-all duration-300 disabled:opacity-50"
                >
                  {submitMutation.isPending
                    ? t.diagnostico.results.emailSending
                    : t.diagnostico.results.emailButton}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto mb-16">
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold/60 mb-2">
                {t.diagnostico.results.emailSentLabel}
              </p>
            </div>
          )}

          <div className="w-12 h-[1px] bg-gold/30 mx-auto mb-16" />

          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {t.diagnostico.results.cta.label}
          </p>

          <h2 className="font-display text-3xl lg:text-5xl font-semibold text-warm-white leading-[1.15] mb-2">
            {t.diagnostico.results.cta.titleLine1}
          </h2>
          <h2 className="font-display text-3xl lg:text-5xl font-semibold text-gold italic leading-[1.15] mb-8">
            {t.diagnostico.results.cta.titleLine2}
          </h2>

          <p className="font-body text-base text-warm-white/60 leading-relaxed max-w-2xl mx-auto mb-8">
            {t.diagnostico.results.cta.description}
          </p>

          {/* Benefits checklist */}
          <div className="max-w-md mx-auto text-left mb-10 space-y-3">
            {[
              t.diagnostico.results.cta.benefit1,
              t.diagnostico.results.cta.benefit2,
              t.diagnostico.results.cta.benefit3,
              t.diagnostico.results.cta.benefit4,
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-gold shrink-0 mt-0.5">✓</span>
                <p className="font-body text-sm text-warm-white/50">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/mentoria"
              className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] border border-warm-white/30 text-warm-white px-8 py-4 hover:border-warm-white/60 transition-all duration-300"
            >
              {t.diagnostico.results.cta.button}
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="font-accent text-xs uppercase tracking-[0.2em] text-warm-white/40 px-8 py-4 hover:text-warm-white/70 transition-colors"
            >
              {t.diagnostico.results.cta.shareButton}
            </button>
          </div>

          {/* Restart */}
          <div className="mt-12">
            <button
              type="button"
              onClick={onRestart}
              className="font-accent text-[10px] uppercase tracking-[0.2em] text-warm-white/30 hover:text-warm-white/60 transition-colors underline underline-offset-4"
            >
              {t.diagnostico.navigation.restart}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
