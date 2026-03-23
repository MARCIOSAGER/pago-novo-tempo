import { type CruzScores } from "@/data/questions-corporate";

interface Props {
  scores: CruzScores;
  variant?: "web" | "static";
}

function getPattern(scores: CruzScores): { label: string; desc: string; risk: string } {
  const { ser, fazer, ter, manifestar } = scores;
  const max = Math.max(ser, fazer, ter, manifestar);
  const allLow = ser < 4 && fazer < 4 && ter < 4 && manifestar < 4;

  if (allLow) return {
    label: "Crise de Identidade",
    desc: "Desconexão generalizada. Nenhum eixo âncora.",
    risk: "Muito alto. Intervenção urgente.",
  };
  if (max === ser) return {
    label: "SER dominante",
    desc: "Identidade ancorada. Decisões consistentes. Base para liderança.",
    risk: "Baixo. Profissional previsível e confiável.",
  };
  if (max === fazer) return {
    label: "FAZER dominante",
    desc: "Identidade na performance. Valor medido pela produtividade.",
    risk: "Médio-alto. Risco de burnout, dificuldade em delegar.",
  };
  if (max === ter) return {
    label: "TER dominante",
    desc: "Identidade no cargo/título. Protege status, resiste a mudanças.",
    risk: "Alto. Decisões políticas, resistência a reorganizações.",
  };
  return {
    label: "MANIFESTAR dominante",
    desc: "Identidade na reputação. Foca no visível, negligencia fundamentos.",
    risk: "Médio. Resultados reais mas frágeis.",
  };
}

export default function CruzProfissional({ scores, variant = "web" }: Props) {
  const pattern = getPattern(scores);
  const maxScore = 10;

  // Position dots on the cross arms (normalized 0-1 for position)
  const normalize = (v: number) => Math.min(v / maxScore, 1);

  const cx = 200;
  const cy = 200;
  const armLength = 130;
  const armWidth = 8;

  // Dot positions
  const serY = cy - armLength * normalize(scores.ser);
  const manifestarY = cy + armLength * normalize(scores.manifestar);
  const terX = cx - armLength * normalize(scores.ter);
  const fazerX = cx + armLength * normalize(scores.fazer);

  return (
    <div className="w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 420" className="w-full">
        <defs>
          <linearGradient id="cpGoldV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity={0} />
            <stop offset="25%" stopColor="#D4AF37" stopOpacity={0.8} />
            <stop offset="75%" stopColor="#D4AF37" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cpGoldH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity={0} />
            <stop offset="25%" stopColor="#D4AF37" stopOpacity={0.8} />
            <stop offset="75%" stopColor="#D4AF37" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
          <filter id="cpGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cross arms */}
        <g opacity={0.25}>
          <rect x={cx - armWidth / 2} y={cy - armLength - 10} width={armWidth} height={(armLength + 10) * 2} rx={armWidth / 2} fill="url(#cpGoldV)" filter="url(#cpGlow)" />
          <rect x={cx - armLength - 10} y={cy - armWidth / 2} width={(armLength + 10) * 2} height={armWidth} rx={armWidth / 2} fill="url(#cpGoldH)" filter="url(#cpGlow)" />
        </g>

        {/* Center circle - SER score */}
        <circle cx={cx} cy={cy} r={28} fill="#1A2744" stroke="#D4C8A8" strokeWidth={1.5} />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#D4C8A8" fontFamily="Cormorant, serif" fontSize="12" fontWeight="600">
          Eu Sou
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#D4C8A8" fontFamily="Montserrat, sans-serif" fontSize="10" fontWeight="500" opacity={0.8}>
          {scores.ser.toFixed(1)}
        </text>

        {/* SER dot (top) */}
        <circle cx={cx} cy={serY} r={5} fill="#1A2744" stroke="#B8A88A" strokeWidth={2} />
        <text x={cx} y={serY - 10} textAnchor="middle" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
          {scores.ser.toFixed(1)}
        </text>

        {/* MANIFESTAR dot (bottom) */}
        <circle cx={cx} cy={manifestarY} r={5} fill="#1A2744" stroke="#B8A88A" strokeWidth={2} />
        <text x={cx} y={manifestarY + 18} textAnchor="middle" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
          {scores.manifestar.toFixed(1)}
        </text>

        {/* TER dot (left) */}
        <circle cx={terX} cy={cy} r={5} fill="#1A2744" stroke="#B8A88A" strokeWidth={2} />
        <text x={terX} y={cy - 10} textAnchor="middle" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
          {scores.ter.toFixed(1)}
        </text>

        {/* FAZER dot (right) */}
        <circle cx={fazerX} cy={cy} r={5} fill="#1A2744" stroke="#B8A88A" strokeWidth={2} />
        <text x={fazerX} y={cy - 10} textAnchor="middle" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
          {scores.fazer.toFixed(1)}
        </text>

        {/* Labels */}
        <text x={cx} y={cy - armLength - 22} textAnchor="middle" fill="#FAFAF8" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="700" letterSpacing="0.08em">
          SER
        </text>
        <text x={cx} y={cy - armLength - 8} textAnchor="middle" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="500" opacity={0.8}>
          Identidade
        </text>

        <text x={cx} y={cy + armLength + 28} textAnchor="middle" fill="#FAFAF8" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="700" letterSpacing="0.08em">
          MANIFESTAR
        </text>
        <text x={cx} y={cy + armLength + 42} textAnchor="middle" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="500" opacity={0.8}>
          Impacto Visível
        </text>

        <text x={cx - armLength - 18} y={cy - 4} textAnchor="end" fill="#FAFAF8" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="700" letterSpacing="0.08em">
          TER
        </text>
        <text x={cx - armLength - 18} y={cy + 10} textAnchor="end" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="500" opacity={0.8}>
          Validação
        </text>

        <text x={cx + armLength + 18} y={cy - 4} textAnchor="start" fill="#FAFAF8" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="700" letterSpacing="0.08em">
          FAZER
        </text>
        <text x={cx + armLength + 18} y={cy + 10} textAnchor="start" fill="#B8A88A" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="500" opacity={0.8}>
          Execução
        </text>
      </svg>

      {/* Pattern interpretation */}
      <div className="rounded-lg bg-[#1A2744]/50 border border-[#B8A88A]/10 p-4 mt-2 text-center">
        <p className="text-sm font-semibold text-[#D4C8A8] mb-1">{pattern.label}</p>
        <p className="text-xs text-[#FAFAF8]/50">{pattern.desc}</p>
        <p className="text-[10px] text-[#FAFAF8]/30 mt-1">Risco: {pattern.risk}</p>
      </div>
    </div>
  );
}
