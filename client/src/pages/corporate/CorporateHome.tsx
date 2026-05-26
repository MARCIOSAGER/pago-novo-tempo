import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Shield, Users, BarChart3, Target, Building2,
  ArrowRight, CheckCircle2,
  LogIn, AlertTriangle, TrendingDown, DollarSign,
  Quote,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DemoRequestModal from "@/components/corporate/DemoRequestModal";
import CustoInvisivelCalculator from "@/components/corporate/CustoInvisivelCalculator";
import B2BQualificationForm from "@/components/corporate/B2BQualificationForm";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const NAVY = "#0B1120";
const NAVY_2 = "#0F1B2D";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#D4B86A";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StarField({ count = 80, color = GOLD }: { count?: number; color?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.2,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 4,
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [count]
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: color,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.size > 2 ? `0 0 ${s.size * 2}px ${color}` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export default function CorporateHome() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [demoOpen, setDemoOpen] = useState(false);

  const { data: orgs, isLoading } = trpc.corporate.myOrgs.useQuery(undefined, {
    enabled: !!user,
  });

  if (orgs && orgs.length === 1) {
    setLocation(`/corporate/${orgs[0].orgSlug}`);
    return null;
  }

  const c = t.corporate.home;

  const pillars = [
    { ...c.metodo.p, icon: Shield },
    { ...c.metodo.a, icon: Target },
    { ...c.metodo.g, icon: BarChart3 },
    { ...c.metodo.o, icon: Users },
  ];

  const problemaStats = [
    { value: c.problema.stat1Value, label: c.problema.stat1Label, icon: Users },
    { value: c.problema.stat2Value, label: c.problema.stat2Label, icon: TrendingDown },
    { value: c.problema.stat3Value, label: c.problema.stat3Label, icon: AlertTriangle },
    { value: c.problema.stat4Value, label: c.problema.stat4Label, icon: DollarSign },
  ];

  const roiCards = [
    { title: c.roi.card1Title, problem: c.roi.card1Problem, impact: c.roi.card1Impact, saving: c.roi.card1Saving },
    { title: c.roi.card2Title, problem: c.roi.card2Problem, impact: c.roi.card2Impact, saving: c.roi.card2Saving },
    { title: c.roi.card3Title, problem: c.roi.card3Problem, impact: c.roi.card3Impact, saving: c.roi.card3Saving },
    { title: c.roi.card4Title, problem: c.roi.card4Problem, impact: c.roi.card4Impact, saving: c.roi.card4Saving },
  ];

  const implSteps = [
    { num: c.implementacao.step1Num, title: c.implementacao.step1Title, period: c.implementacao.step1Period, desc: c.implementacao.step1Desc },
    { num: c.implementacao.step2Num, title: c.implementacao.step2Title, period: c.implementacao.step2Period, desc: c.implementacao.step2Desc },
    { num: c.implementacao.step3Num, title: c.implementacao.step3Title, period: c.implementacao.step3Period, desc: c.implementacao.step3Desc },
    { num: c.implementacao.step4Num, title: c.implementacao.step4Title, period: c.implementacao.step4Period, desc: c.implementacao.step4Desc },
  ];

  const proximosSteps = [
    { num: "1", title: c.proximosPassos.step1Title, desc: c.proximosPassos.step1Desc },
    { num: "2", title: c.proximosPassos.step2Title, desc: c.proximosPassos.step2Desc },
    { num: "3", title: c.proximosPassos.step3Title, desc: c.proximosPassos.step3Desc },
    { num: "4", title: c.proximosPassos.step4Title, desc: c.proximosPassos.step4Desc },
  ];

  const levels = [
    { name: c.diagnostico.levelSolidName, range: c.diagnostico.levelSolidRange, desc: c.diagnostico.levelSolidDesc, color: "#2E8B6A" },
    { name: c.diagnostico.levelBuildingName, range: c.diagnostico.levelBuildingRange, desc: c.diagnostico.levelBuildingDesc, color: "#C9A84C" },
    { name: c.diagnostico.levelFragileName, range: c.diagnostico.levelFragileRange, desc: c.diagnostico.levelFragileDesc, color: "#E08538" },
    { name: c.diagnostico.levelCollapseName, range: c.diagnostico.levelCollapseRange, desc: c.diagnostico.levelCollapseDesc, color: "#C03A3A" },
  ];

  const tools = ["DISC", "MBTI", "CliftonStrengths", "P.A.G.O."];
  const compRows = [
    { label: c.comparativo.rowAFocus, values: [c.comparativo.rowAFocusDisc, c.comparativo.rowAFocusMbti, c.comparativo.rowAFocusCs, c.comparativo.rowAFocusPago] },
    { label: c.comparativo.rowAMede, values: [c.comparativo.rowAMedeDisc, c.comparativo.rowAMedeMbti, c.comparativo.rowAMedeCs, c.comparativo.rowAMedePago] },
    { label: c.comparativo.rowAGran, values: [c.comparativo.rowAGranDisc, c.comparativo.rowAGranMbti, c.comparativo.rowAGranCs, c.comparativo.rowAGranPago] },
    { label: c.comparativo.rowAAplic, values: [c.comparativo.rowAAplicDisc, c.comparativo.rowAAplicMbti, c.comparativo.rowAAplicCs, c.comparativo.rowAAplicPago] },
  ];
  const climaRows = [
    [c.comparativo.rowB1Trad, c.comparativo.rowB1Pago],
    [c.comparativo.rowB2Trad, c.comparativo.rowB2Pago],
    [c.comparativo.rowB3Trad, c.comparativo.rowB3Pago],
    [c.comparativo.rowB4Trad, c.comparativo.rowB4Pago],
    [c.comparativo.rowB5Trad, c.comparativo.rowB5Pago],
    [c.comparativo.rowB6Trad, c.comparativo.rowB6Pago],
  ];

  const credBullets = [c.credibilidade.bullet1, c.credibilidade.bullet2, c.credibilidade.bullet3, c.credibilidade.bullet4];

  return (
    <div style={{ background: NAVY, color: "#FAFAF8" }}>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-20" style={{ background: NAVY }}>
        <StarField count={120} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B1120]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-4xl mx-auto px-6"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-6"
            style={{ color: GOLD }}
          >
            {c.hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-[Cormorant] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] mb-7"
          >
            <span className="text-[#FAFAF8]">{c.hero.titleLine1}</span>{" "}
            <span style={{ color: GOLD }}>{c.hero.titleLine2A}</span>{" "}
            <span className="text-[#FAFAF8]">{c.hero.titleLine2B}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="font-[Montserrat] text-base sm:text-lg text-[#FAFAF8]/70 mb-10 leading-relaxed max-w-2xl"
          >
            {c.hero.subtitle}
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-start gap-4">
            <button
              onClick={() => scrollToId("proximos-passos")}
              className="group inline-flex items-center gap-3 font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-lg transition-colors duration-300"
              style={{ background: GOLD, color: NAVY }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GOLD_LIGHT)}
              onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
            >
              {c.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToId("roi")}
              className="inline-flex items-center gap-2 font-[Montserrat] text-sm uppercase tracking-wider px-8 py-4 rounded-lg border transition-colors duration-300"
              style={{ borderColor: `${GOLD}55`, color: "#FAFAF8" }}
            >
              {c.hero.ctaSecondary}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── PROBLEMA ─── */}
      <section id="problema" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.problema.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight max-w-3xl mx-auto mb-6">
              {c.problema.titleA} <span style={{ color: GOLD }} className="italic">{c.problema.titleHighlight}</span> {c.problema.titleB}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-base text-[#FAFAF8]/65 max-w-2xl mx-auto leading-relaxed">
              {c.problema.lead}
            </motion.p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14"
          >
            {problemaStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="rounded-xl p-6 border text-center"
                  style={{ background: `${NAVY_2}80`, borderColor: `${GOLD}25` }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-4" style={{ color: `${GOLD}99` }} />
                  <p className="font-[Cormorant] text-4xl font-bold mb-2" style={{ color: GOLD }}>
                    {s.value}
                  </p>
                  <p className="font-[Montserrat] text-xs text-[#FAFAF8]/55 leading-relaxed">
                    {s.label}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Example box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto rounded-2xl p-8 sm:p-10 border text-center"
            style={{ background: `${NAVY_2}90`, borderColor: `${GOLD}40` }}
          >
            <p className="font-[Montserrat] text-sm text-[#FAFAF8]/70 mb-4">
              {c.problema.exampleTitle}
            </p>
            <p className="font-[Cormorant] text-4xl sm:text-5xl font-bold mb-3" style={{ color: GOLD }}>
              {c.problema.exampleValue}
            </p>
            <p className="font-[Montserrat] text-sm text-[#FAFAF8]/60">
              {c.problema.exampleSuffix}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CAUSA ─── */}
      <section id="causa" className="relative py-24 lg:py-32 scroll-mt-20 overflow-hidden" style={{ background: NAVY_2 }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.causa.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-6">
              {c.causa.title1}{" "}
              <span style={{ color: GOLD }} className="italic">{c.causa.title2}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-base text-[#FAFAF8]/70 mb-5 leading-relaxed">
              {c.causa.p1}
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="font-[Montserrat] text-base text-[#FAFAF8]/80 mb-5 leading-relaxed">
              {c.causa.p2Pre}{" "}
              <span style={{ color: GOLD }} className="font-semibold">{c.causa.p2Highlight}</span>{" "}
              {c.causa.p2Post}
            </motion.p>
            <motion.p variants={fadeUp} custom={4} className="font-[Montserrat] text-sm text-[#FAFAF8]/55 leading-relaxed">
              {c.causa.p3}
            </motion.p>
          </motion.div>

          {/* Tree metaphor — Árvore P.A.G.O Corp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border"
            style={{ borderColor: `${GOLD}30` }}
          >
            <img
              src="/tree-roots.webp"
              alt="Árvore com raízes profundas — metáfora do Governo Interior"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── METODOLOGIA / 4 PILLARS ─── */}
      <section id="metodo" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.metodo.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 max-w-3xl mx-auto">
              {c.metodo.title}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-sm text-[#FAFAF8]/60 max-w-2xl mx-auto">
              {c.metodo.subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.letter}
                  variants={fadeUp}
                  custom={i}
                  className="group relative rounded-xl p-7 border transition-colors duration-300"
                  style={{ background: `${NAVY_2}80`, borderColor: `${GOLD}20` }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className="font-[Cormorant] text-5xl font-bold" style={{ color: GOLD }}>
                      {p.letter}
                    </span>
                    <Icon className="w-5 h-5 mt-2" style={{ color: `${GOLD}66` }} />
                  </div>
                  <h3 className="font-[Cormorant] text-2xl font-semibold text-[#FAFAF8] mb-1">
                    {p.name}
                  </h3>
                  <p className="font-[Montserrat] text-[10px] uppercase tracking-[0.18em] mb-4" style={{ color: GOLD }}>
                    {p.slogan}
                  </p>
                  <p className="font-[Montserrat] text-sm text-[#FAFAF8]/60 leading-relaxed mb-4">
                    {p.desc}
                  </p>
                  <div className="pt-4 border-t" style={{ borderColor: `${GOLD}15` }}>
                    <p className="font-[Montserrat] text-[11px] text-[#FAFAF8]/45 italic leading-relaxed">
                      {p.sub}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── DIAGNÓSTICO / FERRAMENTA ─── */}
      <section id="diagnostico" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY_2 }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.diagnostico.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold mb-5">
              {c.diagnostico.title}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-base text-[#FAFAF8]/65 max-w-2xl mx-auto leading-relaxed">
              {c.diagnostico.subtitle}
            </motion.p>
          </motion.div>

          {/* Features pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-14"
          >
            {[c.diagnostico.feat1, c.diagnostico.feat2, c.diagnostico.feat3, c.diagnostico.feat4].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-2 font-[Montserrat] text-xs sm:text-sm text-[#FAFAF8]/80 px-4 py-2 rounded-full border"
                style={{ borderColor: `${GOLD}30`, background: `${NAVY}80` }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GOLD }} />
                {f}
              </span>
            ))}
          </motion.div>

          {/* Result levels */}
          <div className="max-w-3xl mx-auto">
            <p className="font-[Montserrat] text-xs uppercase tracking-[0.25em] text-[#FAFAF8]/40 mb-5 text-center">
              {c.diagnostico.levelsTitle}
            </p>
            <div className="space-y-3">
              {levels.map((lv, i) => (
                <motion.div
                  key={lv.name}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-4 sm:gap-6 px-5 py-4 rounded-lg border"
                  style={{ background: `${NAVY}60`, borderColor: `${GOLD}15` }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lv.color }} />
                  <span className="font-[Cormorant] text-xl font-semibold text-[#FAFAF8] w-32 flex-shrink-0">
                    {lv.name}
                  </span>
                  <span className="font-[Montserrat] text-xs text-[#FAFAF8]/50 w-20 flex-shrink-0 font-medium">
                    {lv.range}
                  </span>
                  <span className="font-[Montserrat] text-sm text-[#FAFAF8]/60">
                    — {lv.desc}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ROI / RESULTADOS ─── */}
      <section id="roi" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.roi.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold mb-5">
              {c.roi.title}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-base text-[#FAFAF8]/65 max-w-2xl mx-auto">
              {c.roi.subtitleA}{" "}
              <span style={{ color: GOLD }} className="font-semibold">{c.roi.subtitleHighlight}</span>
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
          >
            {roiCards.map((card, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="rounded-xl p-6 border flex flex-col"
                style={{ background: `${NAVY_2}80`, borderColor: `${GOLD}20` }}
              >
                <h3 className="font-[Cormorant] text-xl font-semibold text-[#FAFAF8] mb-5">
                  {card.title}
                </h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="font-[Montserrat] text-[10px] uppercase tracking-[0.2em] text-[#FAFAF8]/40 mb-1">
                      {c.roi.labelProblem}
                    </p>
                    <p className="font-[Montserrat] text-xs text-[#FAFAF8]/70 leading-relaxed">
                      {card.problem}
                    </p>
                  </div>
                  <div>
                    <p className="font-[Montserrat] text-[10px] uppercase tracking-[0.2em] text-[#FAFAF8]/40 mb-1">
                      {c.roi.labelImpact}
                    </p>
                    <p className="font-[Montserrat] text-xs font-semibold" style={{ color: GOLD }}>
                      {card.impact}
                    </p>
                  </div>
                  <div className="pt-3 border-t" style={{ borderColor: `${GOLD}15` }}>
                    <p className="font-[Montserrat] text-[10px] uppercase tracking-[0.2em] text-[#FAFAF8]/40 mb-1">
                      {c.roi.labelSaving}
                    </p>
                    <p className="font-[Cormorant] text-2xl font-bold" style={{ color: GOLD }}>
                      {card.saving}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center rounded-2xl p-8 border"
            style={{ background: `${NAVY_2}b0`, borderColor: `${GOLD}50` }}
          >
            <p className="font-[Montserrat] text-xs uppercase tracking-[0.25em] text-[#FAFAF8]/60 mb-3">
              {c.roi.totalLabel}
            </p>
            <p className="font-[Cormorant] text-5xl sm:text-6xl font-bold" style={{ color: GOLD }}>
              {c.roi.totalValue}
              <span className="text-2xl ml-2 text-[#FAFAF8]/40 font-normal">{c.roi.totalSuffix}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CALCULADORA ─── */}
      <section id="calculadora" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY_2 }}>
        <div className="max-w-6xl mx-auto px-6">
          <CustoInvisivelCalculator onCta={() => scrollToId("proximos-passos")} />
        </div>
      </section>

      {/* ─── IMPLEMENTAÇÃO ─── */}
      <section id="como-funciona" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.implementacao.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold mb-5 leading-tight">
              {c.implementacao.titleA}{" "}
              <span style={{ color: GOLD }} className="italic">{c.implementacao.titleHighlight}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-sm text-[#FAFAF8]/60 max-w-2xl mx-auto">
              {c.implementacao.subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {implSteps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="relative rounded-xl p-6 border"
                style={{ background: `${NAVY_2}80`, borderColor: `${GOLD}20` }}
              >
                <p className="font-[Cormorant] text-5xl font-bold mb-3" style={{ color: `${GOLD}55` }}>
                  {step.num}
                </p>
                <h3 className="font-[Cormorant] text-xl font-semibold text-[#FAFAF8] mb-1">
                  {step.title}
                </h3>
                <p className="font-[Montserrat] text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>
                  {step.period}
                </p>
                <p className="font-[Montserrat] text-sm text-[#FAFAF8]/55 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── COMPARATIVO ─── */}
      <section id="comparativo" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY_2 }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.comparativo.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold mb-5">
              {c.comparativo.title}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-sm text-[#FAFAF8]/60 max-w-2xl mx-auto">
              {c.comparativo.subtitle}
            </motion.p>
          </motion.div>

          {/* vs Assessment */}
          <div className="mb-16">
            <h3 className="font-[Cormorant] text-xl sm:text-2xl font-semibold text-[#FAFAF8] text-center mb-8">
              {c.comparativo.sectionA}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left font-[Montserrat] text-[10px] uppercase tracking-wider text-[#FAFAF8]/30 pb-4 pr-4 w-[160px]" />
                    {tools.map((tool) => (
                      <th key={tool} className="text-left font-[Montserrat] text-xs uppercase tracking-wider pb-4 px-4"
                        style={{ color: tool === "P.A.G.O." ? GOLD : "rgba(250,250,248,0.4)" }}>
                        {tool}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compRows.map((row, ri) => (
                    <tr key={row.label} className={ri < compRows.length - 1 ? "border-b" : ""} style={{ borderColor: "rgba(250,250,248,0.05)" }}>
                      <td className="font-[Montserrat] text-sm text-[#FAFAF8]/50 py-5 pr-4 align-top">
                        {row.label}
                      </td>
                      {row.values.map((val, vi) => (
                        <td key={vi} className="font-[Montserrat] text-sm py-5 px-4 align-top leading-relaxed"
                          style={{ color: vi === 3 ? GOLD : "rgba(250,250,248,0.4)", fontWeight: vi === 3 ? 500 : 400 }}>
                          {vi === 3 && <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" style={{ color: GOLD }} />}
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* vs Climate */}
          <div>
            <h3 className="font-[Cormorant] text-xl sm:text-2xl font-semibold text-[#FAFAF8] text-center mb-8">
              {c.comparativo.sectionB}
            </h3>
            <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border" style={{ borderColor: `${GOLD}20` }}>
              <div className="grid grid-cols-2">
                <div className="font-[Cormorant] text-sm sm:text-base font-semibold text-[#FAFAF8]/50 px-5 py-4 text-center border-r" style={{ background: `${NAVY}60`, borderColor: `${GOLD}20` }}>
                  {c.comparativo.tradHeader}
                </div>
                <div className="font-[Cormorant] text-sm sm:text-base font-semibold px-5 py-4 text-center" style={{ background: `${GOLD}15`, color: GOLD }}>
                  {c.comparativo.pagoHeader}
                </div>
              </div>
              {climaRows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-2 border-t" style={{ borderColor: `${GOLD}10` }}>
                  <div className="font-[Montserrat] text-xs sm:text-sm text-[#FAFAF8]/55 px-5 py-4 border-r" style={{ borderColor: `${GOLD}10` }}>
                    {row[0]}
                  </div>
                  <div className="font-[Montserrat] text-xs sm:text-sm px-5 py-4 flex items-start gap-2" style={{ color: "rgba(250,250,248,0.9)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                    {row[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CREDIBILIDADE / Jefferson ─── */}
      <section id="credibilidade" className="relative py-24 lg:py-32 scroll-mt-20" style={{ background: NAVY }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.credibilidade.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold max-w-3xl mx-auto leading-tight">
              {c.credibilidade.title}
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-12 items-start rounded-2xl p-8 sm:p-10 border"
            style={{ background: `${NAVY_2}80`, borderColor: `${GOLD}25` }}
          >
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 border-2"
                style={{ background: `${GOLD}15`, borderColor: `${GOLD}50`, color: GOLD }}>
                <span className="font-[Cormorant] text-4xl font-bold">JE</span>
              </div>
              <p className="font-[Cormorant] text-lg font-semibold text-[#FAFAF8]">
                {c.credibilidade.name}
              </p>
              <p className="font-[Montserrat] text-[11px] uppercase tracking-wider mt-1" style={{ color: GOLD }}>
                {c.credibilidade.role}
              </p>
            </div>

            <div>
              <p className="font-[Montserrat] text-sm text-[#FAFAF8]/75 leading-relaxed mb-5">
                {c.credibilidade.bio1}
              </p>
              <p className="font-[Montserrat] text-sm text-[#FAFAF8]/60 leading-relaxed mb-6">
                {c.credibilidade.bio2}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
                {credBullets.map((b) => (
                  <li key={b} className="font-[Montserrat] text-xs text-[#FAFAF8]/70 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                    {b}
                  </li>
                ))}
              </ul>
              <blockquote className="relative pl-6 border-l-2 italic font-[Cormorant] text-lg sm:text-xl text-[#FAFAF8]/85"
                style={{ borderColor: GOLD }}>
                <Quote className="absolute -left-3 -top-1 w-5 h-5" style={{ color: GOLD }} />
                "{c.credibilidade.quote}"
              </blockquote>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRÓXIMOS PASSOS + FORM ─── */}
      <section id="proximos-passos" className="relative py-24 lg:py-32 scroll-mt-20 overflow-hidden" style={{ background: NAVY_2 }}>
        <StarField count={50} />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="font-[Montserrat] text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>
              {c.proximosPassos.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-[Cormorant] text-3xl sm:text-4xl md:text-5xl font-semibold mb-5 leading-tight">
              {c.proximosPassos.titleA}{" "}
              <span style={{ color: GOLD }} className="italic">{c.proximosPassos.titleHighlight}</span>{" "}
              {c.proximosPassos.titleB}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="font-[Montserrat] text-sm text-[#FAFAF8]/60 max-w-2xl mx-auto">
              {c.proximosPassos.subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14"
          >
            {proximosSteps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="rounded-xl p-5 border text-center"
                style={{ background: `${NAVY}90`, borderColor: `${GOLD}20` }}
              >
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center border"
                  style={{ borderColor: `${GOLD}50`, color: GOLD }}>
                  <span className="font-[Cormorant] text-lg font-bold">{step.num}</span>
                </div>
                <h3 className="font-[Cormorant] text-base sm:text-lg font-semibold text-[#FAFAF8] mb-2">
                  {step.title}
                </h3>
                <p className="font-[Montserrat] text-xs text-[#FAFAF8]/55 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <B2BQualificationForm />
        </div>
      </section>

      {/* ─── ORG SELECTOR (logged-in) ─── */}
      {user && (
        <section className="relative py-20 px-6" style={{ background: NAVY }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <Building2 className="w-10 h-10 mx-auto mb-4" style={{ color: GOLD }} />
              <h2 className="font-[Cormorant] text-2xl font-semibold text-[#FAFAF8] mb-2">
                {c.title}
              </h2>
              <p className="font-[Montserrat] text-sm text-[#FAFAF8]/50">
                {c.subtitle}
              </p>
            </div>

            {authLoading || isLoading ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full animate-spin border-2"
                  style={{ borderColor: `${GOLD}40`, borderTopColor: GOLD }} />
              </div>
            ) : orgs && orgs.length > 0 ? (
              <div className="space-y-3">
                {orgs.map((org: { orgId: number; orgName: string; orgSlug: string; orgLogo: string | null; memberRole: string }) => (
                  <button
                    key={org.orgId}
                    onClick={() => setLocation(`/corporate/${org.orgSlug}`)}
                    className="w-full flex items-center justify-between rounded-xl p-5 border group transition-colors"
                    style={{ background: `${NAVY_2}80`, borderColor: `${GOLD}20` }}
                  >
                    <div className="flex items-center gap-4">
                      {org.orgLogo ? (
                        <img src={org.orgLogo} alt={org.orgName} className="w-11 h-11 rounded-lg object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}15` }}>
                          <Building2 className="w-5 h-5" style={{ color: GOLD }} />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-[Cormorant] text-lg font-semibold text-[#FAFAF8]">{org.orgName}</p>
                        <p className="font-[Montserrat] text-[#FAFAF8]/40 text-[10px] uppercase tracking-wider">
                          {org.memberRole.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#FAFAF8]/40 group-hover:text-[#FAFAF8] transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-8 text-center border" style={{ background: `${NAVY_2}80`, borderColor: `${GOLD}20` }}>
                <p className="font-[Montserrat] text-sm text-[#FAFAF8]/50">
                  {c.noOrgs}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Login section for non-authenticated users */}
      {!user && !authLoading && (
        <section className="relative py-20 px-6" style={{ background: NAVY }}>
          <div className="max-w-lg mx-auto text-center">
            <LogIn className="w-7 h-7 mx-auto mb-4" style={{ color: GOLD }} />
            <h2 className="font-[Cormorant] text-2xl font-semibold text-[#FAFAF8] mb-3">
              {c.loginPrompt}
            </h2>
            <a
              href="/login?returnTo=%2Fcorporate"
              className="inline-flex items-center gap-3 font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-7 py-3.5 rounded-lg transition-colors duration-300"
              style={{ background: GOLD, color: NAVY }}
            >
              <LogIn className="w-4 h-4" />
              {c.loginButton}
            </a>
          </div>
        </section>
      )}

      <Footer />
      <DemoRequestModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
