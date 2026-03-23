import { useCorporate } from "@/contexts/CorporateContext";
import { ClipboardList, BarChart3, History, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function EmployeeDashboard() {
  const { orgName, orgSlug } = useCorporate();

  const cards = [
    {
      icon: ClipboardList,
      title: "Iniciar Diagnóstico",
      desc: "Avalie os 4 pilares P.A.G.O. no contexto da sua organização.",
      href: `/corporate/${orgSlug}/diagnostico`,
      cta: "Iniciar",
    },
    {
      icon: BarChart3,
      title: "Meus Resultados",
      desc: "Veja sua pontuação e compare com a média da empresa.",
      href: `/corporate/${orgSlug}/resultados`,
      cta: "Ver",
    },
    {
      icon: History,
      title: "Histórico",
      desc: "Acompanhe sua evolução ao longo do tempo.",
      href: `/corporate/${orgSlug}/historico`,
      cta: "Ver",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
          Diagnóstico Corporativo
        </p>
        <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8] tracking-tight">
          Bem-vindo, {orgName}
        </h1>
      </div>

      {/* Welcome card */}
      <div className="rounded-xl bg-gradient-to-br from-[#1A2744] to-[#2A3A5C] border border-[#B8A88A]/15 p-6 flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-[#B8A88A]/10 flex items-center justify-center shrink-0 mt-1">
          <Sparkles className="h-5 w-5 text-[#B8A88A]" />
        </div>
        <div>
          <h2 className="text-lg font-[Cormorant] font-semibold text-[#FAFAF8] mb-1">
            Diagnóstico P.A.G.O. Corporativo
          </h2>
          <p className="text-sm text-[#FAFAF8]/50 leading-relaxed">
            Responda o diagnóstico para avaliar os 4 pilares — Princípio, Alinhamento, Governo e Obediência —
            no contexto da sua organização. Seus resultados são confidenciais.
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="group rounded-xl bg-[#1A2744] border border-[#B8A88A]/10 p-5 hover:border-[#B8A88A]/25 transition-all duration-200 cursor-pointer h-full flex flex-col">
              <div className="h-9 w-9 rounded-lg bg-[#B8A88A]/10 flex items-center justify-center mb-4">
                <card.icon className="h-5 w-5 text-[#B8A88A]" />
              </div>
              <h3 className="text-sm font-semibold text-[#FAFAF8] mb-1">{card.title}</h3>
              <p className="text-xs text-[#FAFAF8]/40 leading-relaxed flex-1">{card.desc}</p>
              <span className="text-xs text-[#B8A88A] font-medium mt-3 group-hover:underline">
                {card.cta} &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
