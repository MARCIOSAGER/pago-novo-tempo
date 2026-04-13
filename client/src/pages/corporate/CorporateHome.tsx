import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Shield,
  Users,
  BarChart3,
  Target,
  Briefcase,
  GraduationCap,
  Building2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DemoRequestModal from "@/components/corporate/DemoRequestModal";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const pillars = [
  {
    letter: "P",
    name: "Princípio",
    desc: "Base de confiabilidade e consistência ética",
    icon: Shield,
  },
  {
    letter: "A",
    name: "Alinhamento",
    desc: "Aderência estratégica, relacional e interna",
    icon: Target,
  },
  {
    letter: "G",
    name: "Governo",
    desc: "Capacidade de gestão multidimensional",
    icon: BarChart3,
  },
  {
    letter: "O",
    name: "Obediência",
    desc: "Execução, disciplina e geração de resultados",
    icon: Users,
  },
];

const comparisonTools = ["DISC", "MBTI", "CliftonStrengths", "P.A.G.O."];

const comparisonRows: { label: string; values: string[] }[] = [
  {
    label: "Foco principal",
    values: [
      "Comportamento observável",
      "Preferências cognitivas",
      "Talentos naturais",
      "Identidade integral da pessoa",
    ],
  },
  {
    label: "O que mede",
    values: [
      "Estilo de comunicação",
      "Tipo psicológico",
      "Pontos fortes",
      "Caráter, alinhamento, gestão e execução",
    ],
  },
  {
    label: "Granularidade",
    values: ["4 perfis", "16 tipos", "34 temas", "4 pilares × 11 indicadores"],
  },
  {
    label: "Aplicação primária",
    values: [
      "Comunicação em equipa",
      "Autoconhecimento",
      "Desenvolvimento individual",
      "Diagnóstico organizacional completo",
    ],
  },
];

const steps = [
  {
    num: "1",
    title: "Solicite uma Demonstração",
    desc: "Preencha o formulário com os dados da sua empresa. A nossa equipa irá analisar e entrar em contacto.",
  },
  {
    num: "2",
    title: "Aprovação e Convite",
    desc: "Após a aprovação, você receberá um email com um convite para criar a sua conta e aceder ao painel da organização.",
  },
  {
    num: "3",
    title: "Configure a Sua Equipa",
    desc: "Como administrador, convide os seus colaboradores por email. Cada um receberá um link para criar a conta e aceitar o convite.",
  },
  {
    num: "4",
    title: "Diagnóstico P.A.G.O.",
    desc: "44 perguntas estratégicas respondidas em 15–20 minutos. Simples para o colaborador, profundo para a organização.",
  },
  {
    num: "5",
    title: "Resultados e Desenvolvimento",
    desc: "Perfil individual com radar multidimensional + dashboard gerencial com visão completa da equipa e recomendações por departamento.",
  },
];

const useCases = [
  {
    icon: Users,
    title: "Diagnóstico de Equipas",
    desc: "Mapeie forças e lacunas de cada equipa com precisão multidimensional.",
  },
  {
    icon: Briefcase,
    title: "Recrutamento Estratégico",
    desc: "Coloque a pessoa certa no lugar certo — pelo que ela faz e por quem ela é.",
  },
  {
    icon: GraduationCap,
    title: "Formação de Líderes",
    desc: "Identifique perfis de liderança e desenvolva competências com base em dados reais.",
  },
  {
    icon: Building2,
    title: "Cultura Organizacional",
    desc: "Alinhe valores pessoais com valores da empresa para construir cultura autêntica.",
  },
];

export default function CorporateHome() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [demoOpen, setDemoOpen] = useState(false);

  const { data: orgs, isLoading } = trpc.corporate.myOrgs.useQuery(undefined, {
    enabled: !!user,
  });

  // If user has exactly one org, redirect directly
  if (orgs && orgs.length === 1) {
    setLocation(`/corporate/${orgs[0].orgSlug}`);
    return null;
  }

  const c = t.corporate.home;

  return (
    <>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Hero background image */}
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop&crop=center&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.3) saturate(0.4)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B2D]/50 via-[#0F1B2D]/70 to-[#1A2744]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="inline-flex items-center gap-2 text-[#B8A88A] font-[Montserrat] text-xs uppercase tracking-[0.25em] border border-[#B8A88A]/20 rounded-full px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Performance Humana Organizacional
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-[Cormorant] text-5xl sm:text-6xl md:text-7xl font-semibold text-[#D4C8A8] leading-[1.1] mb-6"
          >
            P.A.G.O.
            <br />
            <span className="text-[#FAFAF8]">Corporativo</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="font-[Montserrat] text-lg sm:text-xl text-[#FAFAF8]/70 mb-8 leading-relaxed"
          >
            Performance Humana Baseada em Fundamentos
          </motion.p>

          <motion.blockquote
            variants={fadeUp}
            custom={3}
            className="font-[Cormorant] italic text-lg sm:text-xl text-[#FAFAF8]/50 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            "Colocamos a pessoa certa no lugar certo — não apenas pelo que ela faz,
            mas por quem ela é."
          </motion.blockquote>

          <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setDemoOpen(true)}
              className="group inline-flex items-center gap-3 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-[#D4C8A8] transition-colors duration-300"
            >
              Solicitar Demonstração
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="/login?returnTo=%2Fcorporate"
              className="inline-flex items-center gap-2 text-[#FAFAF8]/50 font-[Montserrat] text-sm hover:text-[#B8A88A] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Já tem convite? Acessar
            </a>
          </motion.div>
        </motion.div>

        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2744] to-transparent" />
      </section>

      {/* ─── 4 PILLARS ─── */}
      <section className="bg-[#1A2744] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="font-[Montserrat] text-xs uppercase tracking-[0.25em] text-[#B8A88A] mb-3"
            >
              Metodologia
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-[Cormorant] text-3xl sm:text-4xl font-semibold text-[#FAFAF8]"
            >
              Os 4 Pilares da Performance Humana
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.letter}
                  variants={fadeUp}
                  custom={i}
                  className="group relative bg-[#0F1B2D]/60 border border-[#B8A88A]/10 rounded-xl p-8 hover:border-[#B8A88A]/25 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-[Cormorant] text-4xl font-bold text-[#D4C8A8]">
                      {p.letter}
                    </span>
                    <Icon className="w-5 h-5 text-[#B8A88A]/50" />
                  </div>
                  <h3 className="font-[Cormorant] text-xl font-semibold text-[#FAFAF8] mb-2">
                    {p.name}
                  </h3>
                  <p className="font-[Montserrat] text-sm text-[#FAFAF8]/50 leading-relaxed">
                    {p.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="bg-[#0F1B2D] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="font-[Montserrat] text-xs uppercase tracking-[0.25em] text-[#B8A88A] mb-3"
            >
              Comparativo
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-[Cormorant] text-3xl sm:text-4xl font-semibold text-[#FAFAF8]"
            >
              Por que P.A.G.O.?
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            custom={0}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left font-[Montserrat] text-xs uppercase tracking-wider text-[#FAFAF8]/30 pb-4 pr-4 w-[160px]" />
                  {comparisonTools.map((tool) => (
                    <th
                      key={tool}
                      className={`text-left font-[Montserrat] text-xs uppercase tracking-wider pb-4 px-4 ${
                        tool === "P.A.G.O."
                          ? "text-[#D4C8A8]"
                          : "text-[#FAFAF8]/40"
                      }`}
                    >
                      {tool}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, ri) => (
                  <tr
                    key={row.label}
                    className={ri < comparisonRows.length - 1 ? "border-b border-[#FAFAF8]/5" : ""}
                  >
                    <td className="font-[Montserrat] text-sm text-[#FAFAF8]/50 py-5 pr-4 align-top">
                      {row.label}
                    </td>
                    {row.values.map((val, vi) => (
                      <td
                        key={vi}
                        className={`font-[Montserrat] text-sm py-5 px-4 align-top leading-relaxed ${
                          vi === 3
                            ? "text-[#D4C8A8] font-medium"
                            : "text-[#FAFAF8]/40"
                        }`}
                      >
                        {vi === 3 && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B8A88A] inline-block mr-1.5 -mt-0.5" />
                        )}
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-[#1A2744] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="font-[Montserrat] text-xs uppercase tracking-[0.25em] text-[#B8A88A] mb-3"
            >
              Processo
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-[Cormorant] text-3xl sm:text-4xl font-semibold text-[#FAFAF8]"
            >
              Como Funciona
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="space-y-8"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="flex gap-6 sm:gap-8 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#B8A88A]/20 flex items-center justify-center">
                  <span className="font-[Cormorant] text-xl font-bold text-[#D4C8A8]">
                    {step.num}
                  </span>
                </div>
                <div className="pt-1">
                  <h3 className="font-[Cormorant] text-xl font-semibold text-[#FAFAF8] mb-2">
                    {step.title}
                  </h3>
                  <p className="font-[Montserrat] text-sm text-[#FAFAF8]/50 leading-relaxed max-w-lg">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="bg-[#0F1B2D] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="font-[Montserrat] text-xs uppercase tracking-[0.25em] text-[#B8A88A] mb-3"
            >
              Aplicações
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-[Cormorant] text-3xl sm:text-4xl font-semibold text-[#FAFAF8]"
            >
              Casos de Uso
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <motion.div
                  key={uc.title}
                  variants={fadeUp}
                  custom={i}
                  className="bg-[#1A2744]/50 border border-[#B8A88A]/8 rounded-xl p-8 hover:border-[#B8A88A]/20 transition-colors duration-300"
                >
                  <Icon className="w-6 h-6 text-[#B8A88A]/60 mb-5" />
                  <h3 className="font-[Cormorant] text-xl font-semibold text-[#FAFAF8] mb-2">
                    {uc.title}
                  </h3>
                  <p className="font-[Montserrat] text-sm text-[#FAFAF8]/50 leading-relaxed">
                    {uc.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="bg-gradient-to-b from-[#0F1B2D] to-[#1A2744] py-28 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-[Cormorant] text-3xl sm:text-4xl font-semibold text-[#FAFAF8] mb-4"
          >
            Pronto para transformar a performance da sua equipa?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="font-[Montserrat] text-sm text-[#FAFAF8]/50 mb-10"
          >
            Agende uma demonstração e descubra como o P.A.G.O. pode revelar o verdadeiro potencial da sua organização.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <button
              onClick={() => setDemoOpen(true)}
              className="group inline-flex items-center gap-3 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-[#D4C8A8] transition-colors duration-300"
            >
              Solicitar Demonstração
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── ORG SELECTOR (logged-in users) ─── */}
      {user && (
        <section className="bg-[#1A2744] py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <Building2 className="w-10 h-10 text-[#B8A88A] mx-auto mb-4" />
              <h2 className="font-[Cormorant] text-2xl font-semibold text-[#FAFAF8] mb-2">
                {c.title}
              </h2>
              <p className="font-[Montserrat] text-sm text-[#FAFAF8]/50">
                {c.subtitle}
              </p>
            </div>

            {authLoading || isLoading ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-[#B8A88A]/30 border-t-[#B8A88A] rounded-full animate-spin" />
              </div>
            ) : orgs && orgs.length > 0 ? (
              <div className="space-y-4">
                {orgs.map(
                  (org: {
                    orgId: number;
                    orgName: string;
                    orgSlug: string;
                    orgLogo: string | null;
                    memberRole: string;
                  }) => (
                    <button
                      key={org.orgId}
                      onClick={() => setLocation(`/corporate/${org.orgSlug}`)}
                      className="w-full flex items-center justify-between bg-[#0F1B2D]/60 border border-[#B8A88A]/10 rounded-xl p-6 hover:border-[#B8A88A]/25 transition-colors duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        {org.orgLogo ? (
                          <img
                            src={org.orgLogo}
                            alt={org.orgName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#B8A88A]/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-[#B8A88A]" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-[Cormorant] text-lg font-semibold text-[#FAFAF8]">
                            {org.orgName}
                          </p>
                          <p className="font-[Montserrat] text-[#FAFAF8]/40 text-xs uppercase tracking-wider">
                            {org.memberRole.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#B8A88A]/40 group-hover:text-[#B8A88A] transition-colors" />
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="bg-[#0F1B2D]/60 border border-[#B8A88A]/10 rounded-xl p-8 text-center">
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
        <section className="relative bg-[#0F1B2D] py-20 px-6 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=600&fit=crop&crop=center&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.2) saturate(0.3)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1B2D]/80 via-[#0F1B2D]/60 to-[#0F1B2D]/80" />
          <div className="relative z-10 max-w-lg mx-auto text-center">
            <LogIn className="w-8 h-8 text-[#B8A88A] mx-auto mb-4" />
            <h2 className="font-[Cormorant] text-2xl font-semibold text-[#FAFAF8] mb-3">
              Já recebeu um convite?
            </h2>
            <p className="font-[Montserrat] text-sm text-[#FAFAF8]/40 mb-8 leading-relaxed">
              Se a sua organização já utiliza o P.A.G.O. Corporativo, faça login para aceder ao seu diagnóstico.
            </p>
            <a
              href="/login?returnTo=%2Fcorporate"
              className="inline-flex items-center gap-3 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-[#D4C8A8] transition-colors duration-300"
            >
              <LogIn className="w-4 h-4" />
              Acessar Minha Conta
            </a>
          </div>
        </section>
      )}

      <Footer />
      <DemoRequestModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  );
}
