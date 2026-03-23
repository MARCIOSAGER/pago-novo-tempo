import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface IdentityCrossProps {
  /** Pilar P score (0-10) — center "Eu Sou" */
  p: number;
  /** A1 Alinhamento Vertical score (0-10) — top "Ser" */
  a1: number;
  /** A3 Alinhamento Interno score (0-10) — left "Ter" (inverted) */
  a3: number;
  /** Pilar G average (0-10) — used for "Fazer" calc */
  g: number;
  /** Pilar O average (0-10) — used for "Fazer" calc */
  o: number;
  /** O3 Fruto da Obediência score (0-10) — bottom "Manifestar" */
  o3: number;
  /** Static mode for PDF (no animations) */
  variant?: "interactive" | "static";
}

/** Calculate cross arm values from PAGO scores */
function calcCrossValues(props: IdentityCrossProps) {
  const { p, a1, a3, g, o, o3 } = props;
  return {
    center: p,
    top: a1,
    bottom: o3,
    left: Math.max(0, 10 - a3), // inverted: low A3 = high "Ter"
    right: Math.max(0, Math.min(10, ((g + o) / 2) - p + 5)), // normalized around 5
  };
}

/** Position a dot along an arm (0-10 → pixel position) */
function dotPosition(value: number, axis: "top" | "bottom" | "left" | "right") {
  const maxLen = 120; // max distance from center
  const ratio = value / 10;
  const dist = 20 + ratio * maxLen; // min 20px from center

  switch (axis) {
    case "top": return { cx: 200, cy: 200 - dist };
    case "bottom": return { cx: 200, cy: 200 + dist };
    case "left": return { cx: 200 - dist, cy: 200 };
    case "right": return { cx: 200 + dist, cy: 200 };
  }
}

function CrossSvg({ values, t, variant }: {
  values: ReturnType<typeof calcCrossValues>;
  t: any;
  variant: "interactive" | "static";
}) {
  const ic = t.diagnostico.identityCross;
  const isStatic = variant === "static";

  const dotTop = dotPosition(values.top, "top");
  const dotBottom = dotPosition(values.bottom, "bottom");
  const dotLeft = dotPosition(values.left, "left");
  const dotRight = dotPosition(values.right, "right");

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto" role="img" aria-label={ic.sectionLabel}>
      <defs>
        {/* Gold metallic gradient - vertical */}
        <linearGradient id="icGoldV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4C8A8" stopOpacity={0} />
          <stop offset="15%" stopColor="#B8A88A" stopOpacity={0.6} />
          <stop offset="50%" stopColor="#D4C8A8" stopOpacity={0.9} />
          <stop offset="85%" stopColor="#B8A88A" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#D4C8A8" stopOpacity={0} />
        </linearGradient>
        {/* Gold metallic gradient - horizontal */}
        <linearGradient id="icGoldH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D4C8A8" stopOpacity={0} />
          <stop offset="15%" stopColor="#B8A88A" stopOpacity={0.6} />
          <stop offset="50%" stopColor="#D4C8A8" stopOpacity={0.9} />
          <stop offset="85%" stopColor="#B8A88A" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#D4C8A8" stopOpacity={0} />
        </linearGradient>
        {/* Glow filter */}
        <filter id="icGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Center radial glow */}
        <radialGradient id="icCenterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Subtle center glow */}
      <circle cx="200" cy="200" r="80" fill="url(#icCenterGlow)" />

      {/* Vertical bar */}
      <rect
        x="193" y="30" width="14" height="340" rx="7"
        fill="url(#icGoldV)" filter="url(#icGlow)"
      />

      {/* Horizontal bar */}
      <rect
        x="30" y="193" width="340" height="14" rx="7"
        fill="url(#icGoldH)" filter="url(#icGlow)"
      />

      {/* Center circle */}
      <circle cx="200" cy="200" r="32" fill="#1A2744" stroke="#D4C8A8" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="32" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity={0.3} />

      {/* Center text: "Eu Sou" */}
      <text x="200" y="194" textAnchor="middle" fill="#D4C8A8"
        fontFamily="Cormorant, serif" fontSize="18" fontWeight="600">
        {ic.center}
      </text>
      {/* Center score */}
      <text x="200" y="214" textAnchor="middle" fill="#D4C8A8"
        fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="500" opacity={0.7}>
        {values.center.toFixed(1)}
      </text>

      {/* Arm labels */}
      {/* Top: "Ser" */}
      <text x="200" y="16" textAnchor="middle" fill="#FAFAF8"
        fontFamily="Montserrat, sans-serif" fontSize="16" fontWeight="600" letterSpacing="0.15em">
        {ic.top.toUpperCase()}
      </text>
      <text x="200" y="33" textAnchor="middle" fill="#B8A88A"
        fontFamily="Montserrat, sans-serif" fontSize="11" fontWeight="400" opacity={0.7}>
        {ic.topSub}
      </text>

      {/* Bottom: "Manifestar" */}
      <text x="200" y="383" textAnchor="middle" fill="#FAFAF8"
        fontFamily="Montserrat, sans-serif" fontSize="16" fontWeight="600" letterSpacing="0.15em">
        {ic.bottom.toUpperCase()}
      </text>
      <text x="200" y="399" textAnchor="middle" fill="#B8A88A"
        fontFamily="Montserrat, sans-serif" fontSize="11" fontWeight="400" opacity={0.7}>
        {ic.bottomSub}
      </text>

      {/* Left: "Ter" */}
      <text x="16" y="195" textAnchor="start" fill="#FAFAF8"
        fontFamily="Montserrat, sans-serif" fontSize="16" fontWeight="600" letterSpacing="0.15em">
        {ic.left.toUpperCase()}
      </text>
      <text x="16" y="212" textAnchor="start" fill="#B8A88A"
        fontFamily="Montserrat, sans-serif" fontSize="11" fontWeight="400" opacity={0.7}>
        {ic.leftSub}
      </text>

      {/* Right: "Fazer" */}
      <text x="384" y="195" textAnchor="end" fill="#FAFAF8"
        fontFamily="Montserrat, sans-serif" fontSize="16" fontWeight="600" letterSpacing="0.15em">
        {ic.right.toUpperCase()}
      </text>
      <text x="384" y="212" textAnchor="end" fill="#B8A88A"
        fontFamily="Montserrat, sans-serif" fontSize="11" fontWeight="400" opacity={0.7}>
        {ic.rightSub}
      </text>

      {/* Score dots on arms */}
      {/* Top dot */}
      <circle {...dotTop} r="8" fill="#1A2744" stroke="#D4C8A8" strokeWidth="1.5" />
      <text x={dotTop.cx} y={dotTop.cy + 4} textAnchor="middle" fill="#D4C8A8"
        fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
        {values.top.toFixed(1)}
      </text>

      {/* Bottom dot */}
      <circle {...dotBottom} r="8" fill="#1A2744" stroke="#D4C8A8" strokeWidth="1.5" />
      <text x={dotBottom.cx} y={dotBottom.cy + 4} textAnchor="middle" fill="#D4C8A8"
        fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
        {values.bottom.toFixed(1)}
      </text>

      {/* Left dot */}
      <circle {...dotLeft} r="8" fill="#1A2744" stroke="#D4C8A8" strokeWidth="1.5" />
      <text x={dotLeft.cx} y={dotLeft.cy + 4} textAnchor="middle" fill="#D4C8A8"
        fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
        {values.left.toFixed(1)}
      </text>

      {/* Right dot */}
      <circle {...dotRight} r="8" fill="#1A2744" stroke="#D4C8A8" strokeWidth="1.5" />
      <text x={dotRight.cx} y={dotRight.cy + 4} textAnchor="middle" fill="#D4C8A8"
        fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="600">
        {values.right.toFixed(1)}
      </text>
    </svg>
  );
}

export default function IdentityCross(props: IdentityCrossProps) {
  const { t } = useLanguage();
  const { variant = "interactive" } = props;
  const values = calcCrossValues(props);
  const ic = t.diagnostico.identityCross;

  if (variant === "static") {
    return (
      <div style={{ maxWidth: 360, margin: "0 auto" }}>
        <CrossSvg values={values} t={t} variant="static" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-md mx-auto"
    >
      <CrossSvg values={values} t={t} variant="interactive" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-6"
      >
        <p className="font-body text-sm text-warm-white/60 leading-relaxed max-w-md mx-auto">
          {ic.description}
        </p>
        <p className="font-body text-sm text-gold-light italic mt-4">
          {ic.verse}
        </p>
      </motion.div>
    </motion.div>
  );
}

/** Static version for printable HTML (inline styles, no Framer Motion) */
export function IdentityCrossStatic(props: Omit<IdentityCrossProps, "variant">) {
  return <IdentityCross {...props} variant="static" />;
}
