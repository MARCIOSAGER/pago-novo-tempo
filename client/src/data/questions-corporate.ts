// ─── P.A.G.O. Corporativo V2.1 — 44 Perguntas de Diagnóstico ────────────────
// Formato: F (Frequência) ou E (Estado)
// F: 1=Nunca, 2=Às vezes, 3=Frequentemente, 4=Sempre
// E: 1=Não está presente, 2=Está frágil, 3=Está crescendo, 4=Está sólido
// Score pilar = (soma / (total × 4)) × 10

export type AnchorType = "F" | "E";

export type Question = {
  id: string;
  pillar: "P" | "A" | "G" | "O";
  subgroup: string | null;
  text: string;
  anchor: AnchorType;
};

export const anchorLabels: Record<AnchorType, string[]> = {
  F: ["Nunca", "Às vezes", "Frequentemente", "Sempre"],
  E: ["Não está presente", "Está frágil", "Está crescendo", "Está sólido"],
};

export const corporateQuestions: Question[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // P — PRINCÍPIO (8 perguntas, subgroup: null)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "P1", pillar: "P", subgroup: null, anchor: "F",
    text: "Quando enfrento uma decisão difícil no trabalho e ninguém está a observar, os meus valores guiam a escolha." },
  { id: "P2", pillar: "P", subgroup: null, anchor: "F",
    text: "As minhas decisões profissionais são consistentes, independentemente do nível de pressão." },
  { id: "P3", pillar: "P", subgroup: null, anchor: "F",
    text: "Quando cometo um erro, assumo a responsabilidade em vez de procurar justificações." },
  { id: "P4", pillar: "P", subgroup: null, anchor: "E",
    text: "Há coerência entre o que digo acreditar e as escolhas concretas que faço no trabalho." },
  { id: "P5", pillar: "P", subgroup: null, anchor: "F",
    text: "Mantenho a mesma postura ética com superiores, pares e subordinados — sem adaptar o carácter à audiência." },
  { id: "P6", pillar: "P", subgroup: null, anchor: "E",
    text: "Os colegas que trabalham comigo conseguiriam nomear os meus princípios inegociáveis." },
  { id: "P7", pillar: "P", subgroup: null, anchor: "F",
    text: "Recuso oportunidades ou atalhos que comprometam os meus valores, mesmo quando o custo é real." },
  { id: "P8", pillar: "P", subgroup: null, anchor: "F",
    text: "As minhas oscilações pessoais (humor, cansaço, frustração) não afectam a qualidade e a ética do meu trabalho." },

  // ═══════════════════════════════════════════════════════════════════════════
  // A — ALINHAMENTO (12 perguntas)
  // Vertical: A1-A4 | Horizontal: A5-A8 | Interno: A9-A12
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "A1", pillar: "A", subgroup: "vertical", anchor: "E",
    text: "Compreendo a visão e a estratégia da empresa e sei como o meu trabalho contribui para ela." },
  { id: "A2", pillar: "A", subgroup: "vertical", anchor: "E",
    text: "Tenho confiança na liderança directa e comunico com transparência — incluindo discordâncias." },
  { id: "A3", pillar: "A", subgroup: "vertical", anchor: "F",
    text: "Quando a direcção toma uma decisão com a qual não concordo, executo com excelência e uso os canais adequados para expressar a minha perspectiva." },
  { id: "A4", pillar: "A", subgroup: "vertical", anchor: "E",
    text: "A minha relação com a cadeia de comando é de parceria estratégica, não apenas de subordinação." },

  { id: "A5", pillar: "A", subgroup: "horizontal", anchor: "E",
    text: "Os meus relacionamentos profissionais são saudáveis — sem conflitos pendentes significativos." },
  { id: "A6", pillar: "A", subgroup: "horizontal", anchor: "F",
    text: "Tenho conversas difíceis quando necessário, em vez de adiar ou evitar." },
  { id: "A7", pillar: "A", subgroup: "horizontal", anchor: "E",
    text: "Os meus colegas sentem a minha presença real — não apenas a minha presença física." },
  { id: "A8", pillar: "A", subgroup: "horizontal", anchor: "F",
    text: "Contribuo activamente para a coesão da equipa, não apenas para os meus objectivos individuais." },

  { id: "A9", pillar: "A", subgroup: "internal", anchor: "E",
    text: "Há coerência entre quem sou e como me apresento profissionalmente — não uso máscaras." },
  { id: "A10", pillar: "A", subgroup: "internal", anchor: "F",
    text: "As minhas decisões são baseadas em convicção, não em busca de aprovação." },
  { id: "A11", pillar: "A", subgroup: "internal", anchor: "F",
    text: "Comporto-me da mesma forma em contextos diferentes — reuniões, corredores, mensagens." },
  { id: "A12", pillar: "A", subgroup: "internal", anchor: "E",
    text: "Conheço os meus pontos fortes e fracos e não preciso de escondê-los." },

  // ═══════════════════════════════════════════════════════════════════════════
  // G — GOVERNO (12 perguntas)
  // Disciplinar: G1-G3 | Emocional: G4-G6 | Financeiro: G7-G9 | Temporal: G10-G12
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "G1", pillar: "G", subgroup: "disciplinar", anchor: "F",
    text: "Tenho uma rotina matinal ou de início de jornada que me prepara para o dia de trabalho." },
  { id: "G2", pillar: "G", subgroup: "disciplinar", anchor: "F",
    text: "Invisto deliberadamente no meu desenvolvimento profissional e pessoal com regularidade." },
  { id: "G3", pillar: "G", subgroup: "disciplinar", anchor: "E",
    text: "As minhas disciplinas de manutenção (saúde, leitura, reflexão, exercício) são consistentes." },

  { id: "G4", pillar: "G", subgroup: "emocional", anchor: "F",
    text: "Em situações de pressão, respondo com lucidez em vez de reagir por impulso." },
  { id: "G5", pillar: "G", subgroup: "emocional", anchor: "E",
    text: "Não carrego ressentimentos profissionais — resolvo ou liberto." },
  { id: "G6", pillar: "G", subgroup: "emocional", anchor: "F",
    text: "Antes de tomar uma decisão importante sob emoção, paro e avalio se estou a responder ou a reagir." },

  { id: "G7", pillar: "G", subgroup: "financeiro", anchor: "E",
    text: "Tenho clareza sobre a minha situação financeira pessoal e ela não afecta o meu desempenho." },
  { id: "G8", pillar: "G", subgroup: "financeiro", anchor: "F",
    text: "Giro os recursos financeiros sob a minha responsabilidade (orçamento, despesas, investimentos) com disciplina." },
  { id: "G9", pillar: "G", subgroup: "financeiro", anchor: "E",
    text: "Tenho reserva e planeamento financeiro — não vivo de salário em salário sem margem." },

  { id: "G10", pillar: "G", subgroup: "temporal", anchor: "E",
    text: "A minha agenda reflecte as minhas prioridades reais — não apenas as urgências dos outros." },
  { id: "G11", pillar: "G", subgroup: "temporal", anchor: "F",
    text: "Sei dizer não a demandas que não estão alinhadas com as minhas prioridades." },
  { id: "G12", pillar: "G", subgroup: "temporal", anchor: "F",
    text: "Tenho blocos de tempo protegidos para trabalho focado — e respeito-os." },

  // ═══════════════════════════════════════════════════════════════════════════
  // O — OBEDIÊNCIA (12 perguntas)
  // Básica: O1-O4 | Radical: O5-O8 | Fruto: O9-O12
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "O1", pillar: "O", subgroup: "basica", anchor: "F",
    text: "Cumpro os compromissos que assumo — prazos, entregas, acordos — de forma consistente." },
  { id: "O2", pillar: "O", subgroup: "basica", anchor: "F",
    text: "Respeito os processos estabelecidos, mesmo quando considero que poderiam ser melhores." },
  { id: "O3", pillar: "O", subgroup: "basica", anchor: "F",
    text: "Sou pontual e fiel nos detalhes — não apenas nos grandes momentos." },
  { id: "O4", pillar: "O", subgroup: "basica", anchor: "E",
    text: "Não há compromissos profissionais pendentes que estou a ignorar ou a adiar." },

  { id: "O5", pillar: "O", subgroup: "radical", anchor: "F",
    text: "Quando a liderança pede algo difícil ou que não faz sentido imediato, executo com confiança e velocidade." },
  { id: "O6", pillar: "O", subgroup: "radical", anchor: "F",
    text: "Executo decisões estratégicas mesmo quando o custo pessoal é alto." },
  { id: "O7", pillar: "O", subgroup: "radical", anchor: "F",
    text: "Não preciso de compreender completamente uma directriz para começar a executá-la." },
  { id: "O8", pillar: "O", subgroup: "radical", anchor: "E",
    text: "A velocidade entre receber uma instrução e iniciar a execução é curta." },

  { id: "O9", pillar: "O", subgroup: "fruto", anchor: "E",
    text: "O meu trabalho gera resultados mensuráveis e consistentes — não apenas actividade." },
  { id: "O10", pillar: "O", subgroup: "fruto", anchor: "E",
    text: "A qualidade das minhas entregas é reconhecida pela liderança e pelos pares." },
  { id: "O11", pillar: "O", subgroup: "fruto", anchor: "E",
    text: "O meu impacto na equipa é positivo — elevo quem está ao meu redor." },
  { id: "O12", pillar: "O", subgroup: "fruto", anchor: "E",
    text: "Há evidências concretas de que a minha presença nesta função faz diferença." },
];

// ─── Helpers de Pontuação ────────────────────────────────────────────────────

export function calcPillarScore(
  answers: Record<string, number>,
  pillar: "P" | "A" | "G" | "O",
): number {
  const pillarQuestions = corporateQuestions.filter((q) => q.pillar === pillar);
  const answered = pillarQuestions.filter((q) => answers[q.id] != null);
  if (answered.length === 0) return 0;
  const sum = answered.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  const max = pillarQuestions.length * 4;
  return parseFloat(((sum / max) * 10).toFixed(2));
}

export function calcSubgroupScore(
  answers: Record<string, number>,
  subgroup: string,
): number {
  const sgQuestions = corporateQuestions.filter((q) => q.subgroup === subgroup);
  if (sgQuestions.length === 0) return 0;
  const sum = sgQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  const max = sgQuestions.length * 4;
  return parseFloat(((sum / max) * 10).toFixed(2));
}

export function getWeakestSubgroup(
  answers: Record<string, number>,
  pillar: "A" | "G" | "O",
): string {
  const subgroups = Array.from(
    new Set(
      corporateQuestions
        .filter((q) => q.pillar === pillar && q.subgroup)
        .map((q) => q.subgroup as string),
    ),
  );
  if (subgroups.length === 0) return "";

  let weakest = subgroups[0];
  let lowestScore = calcSubgroupScore(answers, weakest);
  for (let i = 1; i < subgroups.length; i++) {
    const score = calcSubgroupScore(answers, subgroups[i]);
    if (score < lowestScore) {
      lowestScore = score;
      weakest = subgroups[i];
    }
  }
  return weakest;
}

// ─── Cruz Profissional — Fórmulas V2.1 ──────────────────────────────────────

export interface CruzScores {
  ser: number;        // Score P
  fazer: number;      // G×0.40 + O.Básica×0.30 + O.Radical×0.30
  ter: number;        // 10 - ((A.Interno + P) / 2)
  manifestar: number; // O.Fruto×0.60 + A.Horizontal×0.40
}

export function calcCruzProfissional(answers: Record<string, number>): CruzScores {
  const p = calcPillarScore(answers, "P");
  const aInterno = calcSubgroupScore(answers, "internal");
  const aHorizontal = calcSubgroupScore(answers, "horizontal");
  const g = calcPillarScore(answers, "G");
  const oBasica = calcSubgroupScore(answers, "basica");
  const oRadical = calcSubgroupScore(answers, "radical");
  const oFruto = calcSubgroupScore(answers, "fruto");

  return {
    ser: p,
    fazer: parseFloat((g * 0.40 + oBasica * 0.30 + oRadical * 0.30).toFixed(2)),
    ter: parseFloat((10 - ((aInterno + p) / 2)).toFixed(2)),
    manifestar: parseFloat((oFruto * 0.60 + aHorizontal * 0.40).toFixed(2)),
  };
}

// ─── Status Labels ───────────────────────────────────────────────────────────

export type StatusKey = "solid" | "building" | "fragile" | "collapse";

export function getStatusKey(score: number): StatusKey {
  if (score >= 8) return "solid";
  if (score >= 5.5) return "building";
  if (score >= 3) return "fragile";
  return "collapse";
}

export const statusLabels: Record<StatusKey, string> = {
  solid: "Pilar Sólido",
  building: "Em Construção",
  fragile: "Pilar Frágil",
  collapse: "Em Colapso",
};

export const statusColors: Record<StatusKey, string> = {
  solid: "#2E8B6A",
  building: "#B8A88A",
  fragile: "#C8A951",
  collapse: "#8B4C4C",
};
