import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import { ClipboardList, BarChart3, History, Sparkles, ArrowRight, Trophy, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function EmployeeDashboard() {
  const { orgName, orgSlug, orgId } = useCorporate();
  const [, setLocation] = useLocation();
  const { data: results } = trpc.corporate.myResults.useQuery({ orgId });

  const latest = results?.[0];
  const hasResults = !!latest;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Welcome header */}
      <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8A88A]/50 font-[Montserrat] mb-2">
          Diagnóstico Corporativo
        </p>
        <h1 className="text-4xl font-[Cormorant] font-semibold text-[#FAFAF8] tracking-tight leading-tight">
          Bem-vindo ao P.A.G.O.
        </h1>
        <p className="text-lg text-[#FAFAF8]/30 font-[Cormorant] italic mt-1">{orgName}</p>
      </motion.div>

      {/* Main CTA card */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
        {!hasResults ? (
          <button
            onClick={() => setLocation(`/corporate/${orgSlug}/diagnostico`)}
            className="w-full text-left rounded-2xl bg-gradient-to-br from-[#1A2744] via-[#1F2F50] to-[#2A3A5C] border border-[#B8A88A]/15 p-8 hover:border-[#B8A88A]/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-12 w-12 rounded-xl bg-[#B8A88A]/10 flex items-center justify-center mb-5">
                  <Sparkles className="h-6 w-6 text-[#B8A88A]" />
                </div>
                <h2 className="text-2xl font-[Cormorant] font-semibold text-[#FAFAF8] mb-2">
                  Iniciar Diagnóstico P.A.G.O.
                </h2>
                <p className="text-sm text-[#FAFAF8]/40 leading-relaxed max-w-lg">
                  Avalie as 4 dimensões fundamentais da sua atuação profissional — Princípio, Alinhamento, Governo e Obediência. 44 perguntas, 15-20 minutos.
                </p>
                <div className="flex items-center gap-2 mt-5 text-[#B8A88A] text-sm font-medium group-hover:gap-3 transition-all">
                  Começar agora <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-[#1A2744] via-[#1F2F50] to-[#2A3A5C] border border-[#B8A88A]/15 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="h-12 w-12 rounded-xl bg-[#B8A88A]/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-[#B8A88A]" />
                </div>
                <h2 className="text-2xl font-[Cormorant] font-semibold text-[#FAFAF8] mb-1">
                  Seu Último Resultado
                </h2>
                <p className="text-xs text-[#FAFAF8]/30">
                  {new Date(latest.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#FAFAF8] font-[Cormorant]">{latest.mediaGeral.toFixed(1)}</p>
                <p className="text-xs text-[#B8A88A]/60">Média Geral</p>
              </div>
            </div>

            {/* Pillar mini scores */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {(["P", "A", "G", "O"] as const).map((p) => {
                const score = latest[`media${p}` as keyof typeof latest] as number;
                const names: Record<string, string> = { P: "Princípio", A: "Alinhamento", G: "Governo", O: "Obediência" };
                const isWeakest = latest.pilarMaisFraco === p;
                return (
                  <div
                    key={p}
                    className={`rounded-lg p-3 text-center ${isWeakest ? "bg-[#C8A951]/10 border border-[#C8A951]/20" : "bg-[#0F1B2D]/50 border border-[#B8A88A]/5"}`}
                  >
                    <p className="text-lg font-bold text-[#FAFAF8] font-[Cormorant]">{score.toFixed(1)}</p>
                    <p className="text-[9px] text-[#FAFAF8]/30 uppercase tracking-wider">{names[p]}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setLocation(`/corporate/${orgSlug}/resultados`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B8A88A] text-[#1A2744] text-sm font-semibold hover:bg-[#D4C8A8] transition-colors"
              >
                <BarChart3 className="h-4 w-4" /> Ver Resultados Completos
              </button>
              <button
                onClick={() => setLocation(`/corporate/${orgSlug}/diagnostico`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#B8A88A]/20 text-[#B8A88A] text-sm hover:bg-[#B8A88A]/10 transition-colors"
              >
                <TrendingUp className="h-4 w-4" /> Refazer Diagnóstico
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick access cards */}
      <motion.div
        className="grid sm:grid-cols-3 gap-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      >
        {[
          {
            icon: ClipboardList,
            title: "Diagnóstico",
            desc: "44 perguntas sobre os 4 pilares P.A.G.O.",
            href: `/corporate/${orgSlug}/diagnostico`,
          },
          {
            icon: BarChart3,
            title: "Resultados",
            desc: "Radar, Cruz Profissional e diagnóstico personalizado.",
            href: `/corporate/${orgSlug}/resultados`,
          },
          {
            icon: History,
            title: "Histórico",
            desc: "Acompanhe sua evolução ao longo do tempo.",
            href: `/corporate/${orgSlug}/historico`,
          },
        ].map((card) => (
          <motion.button
            key={card.href}
            variants={fadeUp}
            onClick={() => setLocation(card.href)}
            className="text-left rounded-xl bg-[#1A2744] border border-[#B8A88A]/8 p-5 hover:border-[#B8A88A]/20 transition-all duration-200 group h-full flex flex-col"
          >
            <div className="h-10 w-10 rounded-lg bg-[#B8A88A]/8 flex items-center justify-center mb-4 group-hover:bg-[#B8A88A]/15 transition-colors">
              <card.icon className="h-5 w-5 text-[#B8A88A]/60 group-hover:text-[#B8A88A] transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-[#FAFAF8] mb-1">{card.title}</h3>
            <p className="text-[11px] text-[#FAFAF8]/30 leading-relaxed flex-1">{card.desc}</p>
            <span className="text-[11px] text-[#B8A88A]/50 font-medium mt-3 group-hover:text-[#B8A88A] transition-colors flex items-center gap-1">
              Acessar <ArrowRight className="h-3 w-3" />
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* About section */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
        <div className="rounded-xl bg-[#1A2744]/50 border border-[#B8A88A]/5 p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/30 font-[Montserrat] mb-3">Sobre o P.A.G.O. Corporativo</p>
          <p className="text-sm text-[#FAFAF8]/30 leading-relaxed">
            O diagnóstico P.A.G.O. avalia as quatro camadas que determinam a performance sustentável de um profissional: a consistência dos seus princípios, o alinhamento com a organização, a capacidade de gerir recursos e a disciplina de execução. Não mede o que você sabe fazer — mede quem você é quando está sob pressão.
          </p>
          <p className="text-xs text-[#FAFAF8]/15 italic mt-4">
            "Este diagnóstico é uma ferramenta de reflexão. Os resultados são um ponto de partida para conversa com um mentor."
          </p>
        </div>
      </motion.div>
    </div>
  );
}
