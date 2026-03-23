import React from "react";
import {
  Document, Page, View, Text, StyleSheet, Font,
  Svg, Polygon, Circle, G as SvgG, Text as SvgText, Rect, Line as SvgLine,
  Defs, LinearGradient, Stop,
} from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";

// ─── Font Registration ──────────────────────────────────────
Font.register({
  family: "Lora",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-600-normal.ttf", fontWeight: 600 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-italic.ttf", fontStyle: "italic", fontWeight: 400 },
  ],
});
Font.register({
  family: "Montserrat",
  fonts: [
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-400-normal.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-600-normal.ttf", fontWeight: 600 },
  ],
});

// ─── Types ──────────────────────────────────────────────────
type PillarKey = "P" | "A" | "G" | "O";

export interface CorporatePdfInput {
  nome: string;
  cargo?: string;
  departamento?: string;
  orgName: string;
  date: string;
  mediaP: number;
  mediaA: number;
  mediaG: number;
  mediaO: number;
  mediaGeral: number;
  pilarMaisFraco: PillarKey;
  // Subgroup scores
  subgroups: {
    A: { vertical: number; horizontal: number; internal: number };
    G: { disciplinar: number; emocional: number; financeiro: number; temporal: number };
    O: { basica: number; radical: number; fruto: number };
  };
  // Cruz scores
  cruz: { ser: number; fazer: number; ter: number; manifestar: number };
  // Diagnostic texts per pillar
  diagnostics: {
    P: { title: string; summary: string; analysis: string; recommendation: string };
    A: { title: string; summary: string; analysis: string; recommendation: string };
    G: { title: string; summary: string; analysis: string; recommendation: string };
    O: { title: string; summary: string; analysis: string; recommendation: string };
  };
}

// ─── Colors ─────────────────────────────────────────────────
const C = {
  navy: "#1A2744", gold: "#B8A88A", bg: "#FFFFFF", cardBg: "#F9F8F6",
  border: "#E8E4DE", textLight: "#8A8A8A", textMuted: "#6B7280",
  solid: "#2E8B6A", building: "#B8A88A", fragile: "#C8A951", collapse: "#8B4C4C",
};

function getStatus(score: number) {
  if (score >= 8) return { label: "Pilar Sólido", color: C.solid };
  if (score >= 5.5) return { label: "Em Construção", color: C.building };
  if (score >= 3) return { label: "Pilar Frágil", color: C.fragile };
  return { label: "Em Colapso", color: C.collapse };
}

const pillarNames: Record<PillarKey, string> = { P: "Princípio", A: "Alinhamento", G: "Governo", O: "Obediência" };

// ─── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { paddingTop: 50, paddingBottom: 50, paddingHorizontal: 40, backgroundColor: C.bg, color: C.navy, fontFamily: "Lora", fontSize: 10 },
  header: { position: "absolute", top: 15, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: C.gold },
  headerText: { fontFamily: "Montserrat", fontSize: 7, color: C.navy },
  headerSub: { fontFamily: "Montserrat", fontSize: 5.5, color: C.gold },
  footer: { position: "absolute", bottom: 15, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", paddingTop: 6, borderTopWidth: 0.5, borderTopColor: C.gold },
  footerText: { fontFamily: "Montserrat", fontSize: 6, color: C.navy },
  label: { fontFamily: "Montserrat", fontSize: 8, textTransform: "uppercase", letterSpacing: 3, color: C.gold, textAlign: "center", marginBottom: 12 },
  title: { fontFamily: "Lora", fontSize: 22, fontWeight: 600, color: C.navy, textAlign: "center" },
  subtitle: { fontFamily: "Lora", fontSize: 12, color: C.gold, fontStyle: "italic", textAlign: "center", marginBottom: 16 },
  scoreBig: { fontFamily: "Lora", fontSize: 42, fontWeight: 600, color: C.navy, textAlign: "center" },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "48%", backgroundColor: C.cardBg, borderWidth: 0.5, borderColor: C.border, borderRadius: 3, padding: 14 },
  cardLetter: { fontFamily: "Lora", fontSize: 20, fontWeight: 600, color: C.gold },
  cardName: { fontFamily: "Lora", fontSize: 11, fontWeight: 600, color: C.navy, marginTop: 2 },
  cardScore: { fontFamily: "Lora", fontSize: 16, fontWeight: 600, color: C.navy },
  badge: { fontFamily: "Montserrat", fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, paddingVertical: 2, paddingHorizontal: 6, borderWidth: 0.5, alignSelf: "flex-start" },
  subLabel: { fontFamily: "Lora", fontSize: 8, color: C.textMuted },
  subValue: { fontFamily: "Lora", fontSize: 8, fontWeight: 600, color: C.navy },
  subBar: { height: 3, backgroundColor: "#ECEAE6", marginBottom: 5, borderRadius: 1 },
  diagTitle: { fontFamily: "Lora", fontSize: 14, fontWeight: 600, color: C.navy },
  diagStatus: { fontFamily: "Montserrat", fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5 },
  diagBody: { fontFamily: "Lora", fontSize: 9, color: C.textMuted, lineHeight: 1.7, textAlign: "justify" },
  diagRec: { fontFamily: "Lora", fontSize: 9, color: C.navy, lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: C.border },
  divider: { width: 36, height: 0.5, backgroundColor: C.gold, alignSelf: "center", marginVertical: 12 },
  disclaimer: { fontFamily: "Lora", fontSize: 8, fontStyle: "italic", color: C.textLight, textAlign: "center", marginTop: 20, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: C.border },
});

// ─── Radar Chart SVG ────────────────────────────────────────
function RadarChartSvg({ averages }: { averages: Record<PillarKey, number> }) {
  const cx = 200, cy = 130, R = 80;
  const order: PillarKey[] = ["P", "A", "G", "O"];
  const angles = [-90, 0, 90, 180];
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const point = (i: number, val: number) => ({
    x: cx + (val / 10) * R * Math.cos(toRad(angles[i])),
    y: cy + (val / 10) * R * Math.sin(toRad(angles[i])),
  });
  const gridLevels = [2.5, 5, 7.5, 10];
  const dataPoints = order.map((p, i) => point(i, averages[p]));
  const dataStr = dataPoints.map((pt) => `${pt.x},${pt.y}`).join(" ");

  return (
    <Svg width={400} height={270} viewBox="0 0 400 270">
      {gridLevels.map((level) => {
        const pts = order.map((_, i) => point(i, level));
        const str = pts.map((pt) => `${pt.x},${pt.y}`).join(" ");
        return <Polygon key={level} points={str} fill="none" stroke={C.gold} strokeWidth={0.3} strokeOpacity={0.3} />;
      })}
      {order.map((_, i) => {
        const outer = point(i, 10);
        return <SvgLine key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={C.gold} strokeWidth={0.2} strokeOpacity={0.2} />;
      })}
      <Polygon points={dataStr} fill={C.gold} fillOpacity={0.15} stroke={C.gold} strokeWidth={1.5} />
      {dataPoints.map((pt, i) => (
        <React.Fragment key={i}>
          <Circle cx={pt.x} cy={pt.y} r={3} fill={C.bg} stroke={C.gold} strokeWidth={1.5} />
          {/* @ts-expect-error */}
          <SvgText x={point(i, 11.5).x} y={point(i, 11.5).y + 3} fill={C.navy} fontSize={9} fontFamily="Montserrat" fontWeight={600} textAnchor="middle">
            {pillarNames[order[i]]}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

// ─── Cruz SVG ───────────────────────────────────────────────
function CruzSvg({ cruz }: { cruz: CorporatePdfInput["cruz"] }) {
  const cx = 150, cy = 120, arm = 80, w = 5;
  return (
    <Svg width={300} height={260} viewBox="0 0 300 260">
      <Defs>
        <LinearGradient id="cpV" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#D4AF37" stopOpacity={0} />
          <Stop offset="30%" stopColor="#D4AF37" stopOpacity={0.6} />
          <Stop offset="70%" stopColor="#D4AF37" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="cpH" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#D4AF37" stopOpacity={0} />
          <Stop offset="30%" stopColor="#D4AF37" stopOpacity={0.6} />
          <Stop offset="70%" stopColor="#D4AF37" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={cx - w / 2} y={cy - arm} width={w} height={arm * 2} rx={w / 2} fill="url(#cpV)" />
      <Rect x={cx - arm} y={cy - w / 2} width={arm * 2} height={w} rx={w / 2} fill="url(#cpH)" />
      <Circle cx={cx} cy={cy} r={18} fill={C.navy} stroke="#D4C8A8" strokeWidth={1} />
      {/* @ts-expect-error */}
      <SvgText x={cx} y={117} fill="#D4C8A8" fontSize={8} fontFamily="Lora" fontWeight={600} textAnchor="middle">Eu Sou</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx} y={128} fill="#D4C8A8" fontSize={7} fontFamily="Montserrat" textAnchor="middle">{cruz.ser.toFixed(1)}</SvgText>
      {/* Labels */}
      {/* @ts-expect-error */}
      <SvgText x={cx} y={cy - arm - 10} fill={C.navy} fontSize={9} fontFamily="Montserrat" fontWeight={600} textAnchor="middle">SER</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx} y={cy - arm - 1} fill={C.textMuted} fontSize={6} fontFamily="Montserrat" textAnchor="middle">Identidade</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx} y={cy + arm + 16} fill={C.navy} fontSize={9} fontFamily="Montserrat" fontWeight={600} textAnchor="middle">MANIFESTAR</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx} y={cy + arm + 26} fill={C.textMuted} fontSize={6} fontFamily="Montserrat" textAnchor="middle">Impacto</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx - arm - 10} y={cy - 4} fill={C.navy} fontSize={9} fontFamily="Montserrat" fontWeight={600} textAnchor="end">TER</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx - arm - 10} y={cy + 6} fill={C.textMuted} fontSize={6} fontFamily="Montserrat" textAnchor="end">Validação</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx + arm + 10} y={cy - 4} fill={C.navy} fontSize={9} fontFamily="Montserrat" fontWeight={600} textAnchor="start">FAZER</SvgText>
      {/* @ts-expect-error */}
      <SvgText x={cx + arm + 10} y={cy + 6} fill={C.textMuted} fontSize={6} fontFamily="Montserrat" textAnchor="start">Execução</SvgText>
      {/* Score dots */}
      <Circle cx={cx} cy={cy - arm * (cruz.ser / 10)} r={4} fill={C.bg} stroke={C.gold} strokeWidth={1.5} />
      <Circle cx={cx} cy={cy + arm * (cruz.manifestar / 10)} r={4} fill={C.bg} stroke={C.gold} strokeWidth={1.5} />
      <Circle cx={cx - arm * (cruz.ter / 10)} cy={cy} r={4} fill={C.bg} stroke={C.gold} strokeWidth={1.5} />
      <Circle cx={cx + arm * (cruz.fazer / 10)} cy={cy} r={4} fill={C.bg} stroke={C.gold} strokeWidth={1.5} />
    </Svg>
  );
}

// ─── Main Document ──────────────────────────────────────────
function CorporatePdfDocument(input: CorporatePdfInput) {
  const averages: Record<PillarKey, number> = { P: input.mediaP, A: input.mediaA, G: input.mediaG, O: input.mediaO };
  const overall = getStatus(input.mediaGeral);
  const PILLARS: PillarKey[] = ["P", "A", "G", "O"];

  const subgroupEntries: Record<string, { label: string; score: number }[]> = {
    A: [
      { label: "Com a liderança", score: input.subgroups.A.vertical },
      { label: "Com os pares", score: input.subgroups.A.horizontal },
      { label: "Consigo mesmo", score: input.subgroups.A.internal },
    ],
    G: [
      { label: "Disciplinar", score: input.subgroups.G.disciplinar },
      { label: "Emocional", score: input.subgroups.G.emocional },
      { label: "Financeiro", score: input.subgroups.G.financeiro },
      { label: "Temporal", score: input.subgroups.G.temporal },
    ],
    O: [
      { label: "Básica", score: input.subgroups.O.basica },
      { label: "Radical", score: input.subgroups.O.radical },
      { label: "Fruto", score: input.subgroups.O.fruto },
    ],
  };

  const Header = () => (
    <View style={s.header} fixed>
      <View>
        <Text style={s.headerText}>P.A.G.O. CORPORATIVO</Text>
        <Text style={s.headerSub}>{input.orgName}</Text>
      </View>
      <Text style={s.headerSub}>Confidencial</Text>
    </View>
  );

  const Footer = () => (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>metodopago.com</Text>
      <Text style={{ ...s.footerText, color: C.gold }}>{input.nome}</Text>
    </View>
  );

  return (
    <Document>
      {/* Page 1: Cover + Overview */}
      <Page size="A4" style={s.page}>
        <Header />
        <Footer />
        <View style={{ marginTop: 30 }}>
          <Text style={s.label}>RELATÓRIO DE DIAGNÓSTICO</Text>
          <Text style={s.title}>P.A.G.O. Corporativo</Text>
          <Text style={s.subtitle}>{input.nome}</Text>
          {input.cargo && <Text style={{ ...s.subtitle, fontSize: 10, marginBottom: 4 }}>{input.cargo}{input.departamento ? ` — ${input.departamento}` : ""}</Text>}
          <Text style={{ ...s.subtitle, fontSize: 9, marginBottom: 20 }}>{input.date}</Text>
        </View>

        {/* Overall score */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={s.label}>MÉDIA GERAL</Text>
          <Text style={s.scoreBig}>{input.mediaGeral.toFixed(1)}</Text>
          <View style={{ ...s.badge, borderColor: overall.color, marginTop: 6 }}>
            <Text style={{ color: overall.color, fontFamily: "Montserrat", fontSize: 7, letterSpacing: 1.5, textTransform: "uppercase" }}>{overall.label}</Text>
          </View>
        </View>

        {/* Radar chart */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <RadarChartSvg averages={averages} />
        </View>

        {/* Pillar cards */}
        <View style={s.cardGrid}>
          {PILLARS.map((p) => {
            const score = averages[p];
            const st = getStatus(score);
            const isWeakest = input.pilarMaisFraco === p;
            return (
              <View key={p} style={{ ...s.card, borderColor: isWeakest ? C.fragile : C.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <View>
                    <Text style={s.cardLetter}>{p}.</Text>
                    <Text style={s.cardName}>{pillarNames[p]}</Text>
                  </View>
                  <Text style={s.cardScore}>{score.toFixed(1)}</Text>
                </View>
                <View style={s.subBar}>
                  <View style={{ height: 3, width: `${(score / 10) * 100}%`, backgroundColor: st.color, borderRadius: 1 }} />
                </View>
                <View style={{ ...s.badge, borderColor: st.color }}>
                  <Text style={{ color: st.color, fontFamily: "Montserrat", fontSize: 6, letterSpacing: 1, textTransform: "uppercase" }}>{st.label}</Text>
                </View>
                {/* Subgroup scores */}
                {subgroupEntries[p] && (
                  <View style={{ marginTop: 8 }}>
                    {subgroupEntries[p].map((sg) => (
                      <View key={sg.label} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                        <Text style={s.subLabel}>{sg.label}</Text>
                        <Text style={s.subValue}>{sg.score.toFixed(1)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>

      {/* Page 2: Cruz Profissional + Diagnostics P & A */}
      <Page size="A4" style={s.page}>
        <Header />
        <Footer />
        <View style={{ marginTop: 20 }}>
          <Text style={s.label}>CRUZ PROFISSIONAL</Text>
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <CruzSvg cruz={input.cruz} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 20 }}>
            {[
              { label: "SER", value: input.cruz.ser },
              { label: "FAZER", value: input.cruz.fazer },
              { label: "TER", value: input.cruz.ter },
              { label: "MANIFESTAR", value: input.cruz.manifestar },
            ].map((item) => (
              <View key={item.label} style={{ alignItems: "center" }}>
                <Text style={{ fontFamily: "Montserrat", fontSize: 7, color: C.gold, letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</Text>
                <Text style={{ fontFamily: "Lora", fontSize: 14, fontWeight: 600, color: C.navy }}>{item.value.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.divider} />

        {/* P Diagnostic */}
        <View style={{ marginBottom: 16 }}>
          <Text style={s.diagTitle}>P — {input.diagnostics.P.title}</Text>
          <Text style={{ ...s.diagStatus, color: getStatus(input.mediaP).color, marginBottom: 6 }}>{getStatus(input.mediaP).label} ({input.mediaP.toFixed(1)})</Text>
          <Text style={{ ...s.diagBody, fontStyle: "italic", marginBottom: 6 }}>{input.diagnostics.P.summary}</Text>
          <Text style={s.diagBody}>{input.diagnostics.P.analysis}</Text>
          <Text style={s.diagRec}>Recomendação: {input.diagnostics.P.recommendation}</Text>
        </View>

        <View style={s.divider} />

        {/* A Diagnostic */}
        <View>
          <Text style={s.diagTitle}>A — {input.diagnostics.A.title}</Text>
          <Text style={{ ...s.diagStatus, color: getStatus(input.mediaA).color, marginBottom: 6 }}>{getStatus(input.mediaA).label} ({input.mediaA.toFixed(1)})</Text>
          <Text style={{ ...s.diagBody, fontStyle: "italic", marginBottom: 6 }}>{input.diagnostics.A.summary}</Text>
          <Text style={s.diagBody}>{input.diagnostics.A.analysis}</Text>
          <Text style={s.diagRec}>Recomendação: {input.diagnostics.A.recommendation}</Text>
        </View>
      </Page>

      {/* Page 3: Diagnostics G & O + Synthesis */}
      <Page size="A4" style={s.page}>
        <Header />
        <Footer />
        <View style={{ marginTop: 20, marginBottom: 16 }}>
          <Text style={s.diagTitle}>G — {input.diagnostics.G.title}</Text>
          <Text style={{ ...s.diagStatus, color: getStatus(input.mediaG).color, marginBottom: 6 }}>{getStatus(input.mediaG).label} ({input.mediaG.toFixed(1)})</Text>
          <Text style={{ ...s.diagBody, fontStyle: "italic", marginBottom: 6 }}>{input.diagnostics.G.summary}</Text>
          <Text style={s.diagBody}>{input.diagnostics.G.analysis}</Text>
          <Text style={s.diagRec}>Recomendação: {input.diagnostics.G.recommendation}</Text>
        </View>

        <View style={s.divider} />

        <View style={{ marginBottom: 16 }}>
          <Text style={s.diagTitle}>O — {input.diagnostics.O.title}</Text>
          <Text style={{ ...s.diagStatus, color: getStatus(input.mediaO).color, marginBottom: 6 }}>{getStatus(input.mediaO).label} ({input.mediaO.toFixed(1)})</Text>
          <Text style={{ ...s.diagBody, fontStyle: "italic", marginBottom: 6 }}>{input.diagnostics.O.summary}</Text>
          <Text style={s.diagBody}>{input.diagnostics.O.analysis}</Text>
          <Text style={s.diagRec}>Recomendação: {input.diagnostics.O.recommendation}</Text>
        </View>

        <View style={s.divider} />

        {/* Synthesis */}
        <View style={{ marginBottom: 16 }}>
          <Text style={s.label}>SÍNTESE EXECUTIVA</Text>
          <Text style={s.diagBody}>
            Este profissional apresenta perfil P.A.G.O. com as seguintes características: Princípio ({input.mediaP.toFixed(1)}), Alinhamento ({input.mediaA.toFixed(1)}), Governo ({input.mediaG.toFixed(1)}) e Obediência ({input.mediaO.toFixed(1)}). A área de maior atenção é {pillarNames[input.pilarMaisFraco]} ({averages[input.pilarMaisFraco].toFixed(1)}). Na Cruz Profissional, o perfil aponta para SER={input.cruz.ser.toFixed(1)}, FAZER={input.cruz.fazer.toFixed(1)}, TER={input.cruz.ter.toFixed(1)} e MANIFESTAR={input.cruz.manifestar.toFixed(1)}.
          </Text>
        </View>

        <Text style={s.disclaimer}>
          Este diagnóstico é uma ferramenta de reflexão. Os resultados são um ponto de partida para conversa com um mentor ou facilitador certificado P.A.G.O.
        </Text>
        <Text style={{ ...s.disclaimer, marginTop: 4, borderTopWidth: 0 }}>
          P.A.G.O. Corporativo — Performance Humana Baseada em Fundamentos | metodopago.com
        </Text>
      </Page>
    </Document>
  );
}

// ─── Export Function ────────────────────────────────────────
export async function generateCorporatePdfBase64(input: CorporatePdfInput): Promise<string> {
  const doc = React.createElement(CorporatePdfDocument, input);
  // @ts-expect-error — @react-pdf/renderer types
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
