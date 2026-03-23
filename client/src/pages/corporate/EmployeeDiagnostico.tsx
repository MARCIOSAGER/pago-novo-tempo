import { useState } from "react";
import { useCorporate } from "@/contexts/CorporateContext";
import { trpc } from "@/lib/trpc";
import CorporateDiagnosticoFlow from "@/components/corporate/CorporateDiagnosticoFlow";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ClipboardList, Sparkles } from "lucide-react";

export default function EmployeeDiagnostico() {
  const { orgId, orgSlug, orgName } = useCorporate();
  const [, setLocation] = useLocation();
  const [started, setStarted] = useState(false);

  const submitMutation = trpc.corporate.submitDiagnostic.useMutation({
    onSuccess: () => {
      toast.success("Diagnóstico concluído com sucesso!");
      setLocation(`/corporate/${orgSlug}/resultados`);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao salvar diagnóstico.");
    },
  });

  const handleComplete = (data: {
    answersP: number[];
    answersA: number[];
    answersG: number[];
    answersO: number[];
    mediaP: number;
    mediaA: number;
    mediaG: number;
    mediaO: number;
    mediaGeral: number;
    pilarMaisFraco: "P" | "A" | "G" | "O";
  }) => {
    submitMutation.mutate({
      orgId,
      questionnaireId: 1, // Corporate questionnaire ID
      answersP: data.answersP,
      answersA: data.answersA,
      answersG: data.answersG,
      answersO: data.answersO,
      mediaP: data.mediaP,
      mediaA: data.mediaA,
      mediaG: data.mediaG,
      mediaO: data.mediaO,
      mediaGeral: data.mediaGeral,
      pilarMaisFraco: data.pilarMaisFraco,
    });
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8A88A]/60 font-[Montserrat] mb-1">
            Diagnóstico Corporativo
          </p>
          <h1 className="text-3xl font-[Cormorant] font-semibold text-[#FAFAF8]">
            P.A.G.O. Corporativo
          </h1>
          <p className="text-sm text-[#FAFAF8]/40 mt-1">{orgName}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-[#1A2744] to-[#2A3A5C] border border-[#B8A88A]/15 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-[#B8A88A]/10 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-[#B8A88A]" />
            </div>
            <div>
              <h2 className="text-lg font-[Cormorant] font-semibold text-[#FAFAF8] mb-2">
                Sobre o Diagnóstico
              </h2>
              <p className="text-sm text-[#FAFAF8]/50 leading-relaxed">
                O diagnóstico P.A.G.O. Corporativo avalia 4 dimensões fundamentais da sua atuação profissional:
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {[
              { letter: "P", name: "Princípio", desc: "Base de confiabilidade e consistência ética" },
              { letter: "A", name: "Alinhamento", desc: "Aderência estratégica, relacional e interna" },
              { letter: "G", name: "Governo", desc: "Capacidade de gestão multidimensional" },
              { letter: "O", name: "Obediência", desc: "Execução, disciplina e geração de resultados" },
            ].map((p) => (
              <div key={p.letter} className="rounded-lg bg-[#0F1B2D]/50 border border-[#B8A88A]/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#B8A88A] font-bold text-sm">{p.letter}.</span>
                  <span className="text-sm font-medium text-[#FAFAF8]">{p.name}</span>
                </div>
                <p className="text-xs text-[#FAFAF8]/35">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-xs text-[#FAFAF8]/35 mb-6">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#B8A88A]/40 mt-0.5 shrink-0" />
              <span>40 perguntas de múltipla escolha — tempo estimado: 15-20 minutos</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#B8A88A]/40 mt-0.5 shrink-0" />
              <span>Suas respostas são confidenciais — a empresa vê apenas dados agregados</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#B8A88A]/40 mt-0.5 shrink-0" />
              <span>Não há respostas certas ou erradas — responda com honestidade</span>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-lg bg-[#B8A88A] text-[#1A2744] font-semibold text-sm hover:bg-[#D4C8A8] transition-colors"
          >
            Iniciar Diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CorporateDiagnosticoFlow onComplete={handleComplete} />
      {submitMutation.isPending && (
        <div className="fixed inset-0 bg-[#0F1B2D]/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-[#B8A88A]/20 border-t-[#B8A88A] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#FAFAF8]/60">Salvando diagnóstico...</p>
          </div>
        </div>
      )}
    </div>
  );
}
