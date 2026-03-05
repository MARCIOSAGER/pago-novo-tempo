import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Svg,
  Polygon,
  Line as SvgLine,
  Circle,
  G,
  Text as SvgText,
} from "@react-pdf/renderer";
import { getStatusInfo } from "./useDiagnosticoReducer";
import type { PillarKey, PillarSubgroups } from "./useDiagnosticoReducer";

// ─── Font Registration ─────────────────────────────────────
Font.register({
  family: "Lora",
  fonts: [
    { src: "https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOuGQbT0gvTJPa787weuyJGmKxemMeZ.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOuGQbT0gvTJPa787z5vCJGmKxemMeZ.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/lora/v35/0QI8MX1D_JOuMw_LIftLtfOm84LS1Qtih-yDBQ.woff2", fontStyle: "italic", fontWeight: 400 },
  ],
});

Font.register({
  family: "Montserrat",
  fonts: [
    { src: "https://fonts.gstatic.com/s/montserrat/v29/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/montserrat/v29/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w5aXo.woff2", fontWeight: 600 },
  ],
});

// ─── Types ──────────────────────────────────────────────────
export interface PdfDocumentProps {
  nome: string;
  pillarAverages: Record<PillarKey, number>;
  overallAverage: number;
  weakestPillar: PillarKey;
  pillarSubgroups: PillarSubgroups;
  weakestSubgroupPerPillar: Record<PillarKey, string | null>;
  t: any; // i18n translations object
}

const PILLAR_ORDER: PillarKey[] = ["P", "A", "G", "O"];

// ─── Colors ─────────────────────────────────────────────────
const C = {
  navy: "#1A2744",
  gold: "#B8A88A",
  bg: "#FFFFFF",
  cardBg: "#F9F8F6",
  border: "#E8E4DE",
  textLight: "#8A8A8A",
  textMuted: "#6B7280",
};

// ─── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: C.bg,
    color: C.navy,
    fontFamily: "Lora",
    fontSize: 10,
  },
  // Header / Footer
  header: {
    position: "absolute",
    top: 15,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.gold,
  },
  headerText: { fontFamily: "Montserrat", fontSize: 7, color: C.navy },
  headerSub: { fontFamily: "Montserrat", fontSize: 5.5, color: C.gold },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: C.gold,
  },
  footerText: { fontFamily: "Montserrat", fontSize: 6, color: C.navy },
  footerPage: { fontFamily: "Montserrat", fontSize: 6, color: C.gold },
  // Section labels
  label: {
    fontFamily: "Montserrat",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 3,
    color: C.gold,
    textAlign: "center",
    marginBottom: 12,
  },
  // Titles
  displayLg: { fontFamily: "Lora", fontSize: 22, fontWeight: 600, color: C.navy, textAlign: "center" },
  displaySm: { fontFamily: "Lora", fontSize: 15, color: C.gold, fontStyle: "italic", textAlign: "center", marginBottom: 16 },
  scoreBig: { fontFamily: "Lora", fontSize: 42, fontWeight: 600, color: C.navy, textAlign: "center" },
  // Cards
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48%",
    backgroundColor: C.cardBg,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 3,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardLetter: { fontFamily: "Lora", fontSize: 20, fontWeight: 600, color: C.gold },
  cardName: { fontFamily: "Lora", fontSize: 12, fontWeight: 600, color: C.navy, marginTop: 2 },
  cardScore: { fontFamily: "Lora", fontSize: 16, fontWeight: 600, color: C.navy },
  // Progress bar
  progressBg: { height: 3, backgroundColor: C.border, marginBottom: 6 },
  progressFill: { height: 3 },
  // Badge
  badge: {
    fontFamily: "Montserrat",
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    alignSelf: "flex-start",
  },
  // Subgroups
  subRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  subLabel: { fontFamily: "Lora", fontSize: 8, color: C.textMuted },
  subValue: { fontFamily: "Lora", fontSize: 8, fontWeight: 600, color: C.navy },
  subBar: { height: 3, backgroundColor: "#ECEAE6", marginBottom: 5, borderRadius: 1 },
  // Summary
  summaryText: { fontFamily: "Lora", fontSize: 8, color: C.textMuted, lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#E8E4DE" },
  // Analysis section
  analysisTitle: { fontFamily: "Lora", fontSize: 14, fontWeight: 600, color: C.navy },
  analysisStatus: { fontFamily: "Montserrat", fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5 },
  analysisBody: { fontFamily: "Lora", fontSize: 9, color: C.textMuted, lineHeight: 1.7, textAlign: "justify" },
  // Divider
  divider: { width: 36, height: 0.5, backgroundColor: C.gold, alignSelf: "center", marginVertical: 12 },
  // Centered
  center: { textAlign: "center" },
  // Weakest pillar
  weakLetter: { fontFamily: "Lora", fontSize: 36, fontWeight: 600, color: C.gold, textAlign: "center" },
  weakName: { fontFamily: "Lora", fontSize: 18, fontWeight: 600, color: C.navy, textAlign: "center", marginTop: 2, marginBottom: 14 },
  weakText: { fontFamily: "Lora", fontSize: 10, color: C.textMuted, lineHeight: 1.6, textAlign: "justify", maxWidth: 420, alignSelf: "center" },
  verse: { fontFamily: "Lora", fontSize: 9, fontStyle: "italic", color: C.gold, textAlign: "center", marginTop: 12 },
  // Disclaimer
  disclaimer: { fontFamily: "Lora", fontSize: 8, fontStyle: "italic", color: C.textLight, textAlign: "center", marginTop: 20, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: C.border },
});

// ─── Radar Chart SVG ────────────────────────────────────────
function RadarChartSvg({ averages, labels }: { averages: Record<PillarKey, number>; labels: Record<PillarKey, string> }) {
  const cx = 150, cy = 130, R = 90;
  const order: PillarKey[] = ["P", "A", "G", "O"];
  // Angles: P=top(-90), A=right(0), G=bottom(90), O=left(180)
  const angles = [-90, 0, 90, 180];

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const point = (i: number, val: number) => {
    const a = toRad(angles[i]);
    return { x: cx + (val / 10) * R * Math.cos(a), y: cy + (val / 10) * R * Math.sin(a) };
  };

  // Grid levels
  const gridLevels = [2.5, 5, 7.5, 10];
  // Data polygon
  const dataPoints = order.map((p, i) => point(i, averages[p]));
  const dataStr = dataPoints.map((pt) => `${pt.x},${pt.y}`).join(" ");

  return (
    <Svg width={300} height={260} viewBox="0 0 300 260">
      {/* Grid polygons */}
      {gridLevels.map((level) => {
        const pts = order.map((_, i) => point(i, level));
        const str = pts.map((pt) => `${pt.x},${pt.y}`).join(" ");
        return <Polygon key={level} points={str} fill="none" stroke={C.gold} strokeWidth={0.3} strokeOpacity={0.3} />;
      })}
      {/* Axis lines */}
      {order.map((_, i) => {
        const end = point(i, 10);
        return <SvgLine key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={C.gold} strokeWidth={0.3} strokeOpacity={0.2} />;
      })}
      {/* Data fill */}
      <Polygon points={dataStr} fill={C.gold} fillOpacity={0.15} stroke={C.gold} strokeWidth={1.5} />
      {/* Data dots */}
      {dataPoints.map((pt, i) => (
        <G key={i}>
          <Circle cx={pt.x} cy={pt.y} r={3.5} fill={C.bg} stroke={C.gold} strokeWidth={1.5} />
        </G>
      ))}
      {/* Labels */}
      {order.map((p, i) => {
        const labelPt = point(i, 12.5);
        const anchor = i === 1 ? "start" : i === 3 ? "end" : "middle";
        return (
          <SvgText
            key={p}
            x={labelPt.x}
            y={labelPt.y + (i === 0 ? -2 : i === 2 ? 6 : 3)}
            fill={C.navy}
            fontSize={9}
            fontFamily="Montserrat"
            fontWeight={500}
            textAnchor={anchor}
          >
            {labels[p]}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ─── Header / Footer ────────────────────────────────────────
function PageHeader() {
  return (
    <View style={s.header} fixed>
      <View>
        <Text style={s.headerText}>P.A.G.O.</Text>
        <Text style={s.headerSub}>Novo Tempo</Text>
      </View>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>pagonovotempo.com</Text>
      <Text style={s.footerPage} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

// ─── Helper: get analysis text ──────────────────────────────
function getAnalysis(t: any, pillar: PillarKey, statusKey: string, weakSub: string | null) {
  const block = (t.diagnostico.results as any).pillarAnalysis;
  if (!block?.[pillar]?.[statusKey]) return null;
  const sBlock = block[pillar][statusKey];
  const data = pillar === "P" ? sBlock : weakSub ? sBlock[weakSub] : null;
  return data?.analysis ?? null;
}

function getSummary(t: any, pillar: PillarKey, pillarAverages: Record<PillarKey, number>, weakestSubgroupPerPillar: Record<PillarKey, string | null>) {
  const block = (t.diagnostico.results as any).pillarAnalysis;
  if (!block?.[pillar]) return null;
  const status = getStatusInfo(pillarAverages[pillar]);
  const sBlock = block[pillar][status.key];
  if (!sBlock) return null;
  if (pillar === "P") return sBlock.summary ?? null;
  const weakSub = weakestSubgroupPerPillar[pillar];
  if (!weakSub) return null;
  return sBlock[weakSub]?.summary ?? null;
}

// ─── Document ───────────────────────────────────────────────
export default function DiagnosticoPdfDocument({
  nome,
  pillarAverages,
  overallAverage,
  weakestPillar,
  pillarSubgroups,
  weakestSubgroupPerPillar,
  t,
}: PdfDocumentProps) {
  const overallStatus = getStatusInfo(overallAverage);
  const overallStatusLabel = t.diagnostico.results.status[overallStatus.key];
  const weakestData = t.diagnostico.pillars[weakestPillar];
  const weakestAdvice = t.diagnostico.results.pillarAdvice[weakestPillar];
  const pillarLabels = Object.fromEntries(PILLAR_ORDER.map((p) => [p, t.diagnostico.pillars[p].name])) as Record<PillarKey, string>;

  return (
    <Document>
      {/* Page 1 — Score + Cards + Chart */}
      <Page size="A4" style={s.page}>
        <PageHeader />
        <PageFooter />

        {/* Greeting + Overall Score */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={s.label}>{t.diagnostico.results.label}</Text>
          <Text style={s.displayLg}>
            {t.diagnostico.results.greeting} {nome}.
          </Text>
          <Text style={s.displaySm}>{t.diagnostico.results.subtitle}</Text>
          <View style={s.divider} />
          <Text style={s.scoreBig}>{overallAverage.toFixed(1)}</Text>
          <Text style={{ ...s.label, color: C.navy, opacity: 0.5, marginBottom: 6, marginTop: 4 }}>
            {t.diagnostico.results.overallLabel}
          </Text>
          <Text style={{ ...s.badge, borderColor: overallStatus.color, color: overallStatus.color }}>
            {overallStatusLabel}
          </Text>
        </View>

        {/* Pillar Cards (2x2) */}
        <View style={s.cardGrid}>
          {PILLAR_ORDER.map((pillar) => {
            const pd = t.diagnostico.pillars[pillar];
            const st = getStatusInfo(pillarAverages[pillar]);
            const stLabel = t.diagnostico.results.status[st.key];
            const pct = (pillarAverages[pillar] / 10) * 100;
            const subs = pillar !== "P" ? pillarSubgroups[pillar as "A" | "G" | "O"] : null;
            const subLabels = (pd as any).subgroupLabels as Record<string, string> | undefined;
            const summary = getSummary(t, pillar, pillarAverages, weakestSubgroupPerPillar);

            return (
              <View key={pillar} style={s.card} wrap={false}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.cardLetter}>{pd.letter}</Text>
                    <Text style={s.cardName}>{pd.name}</Text>
                  </View>
                  <Text style={s.cardScore}>{pillarAverages[pillar].toFixed(1)}</Text>
                </View>
                <View style={s.progressBg}>
                  <View style={{ ...s.progressFill, width: `${pct}%`, backgroundColor: st.color }} />
                </View>
                <Text style={{ ...s.badge, borderColor: st.color, color: st.color }}>{stLabel}</Text>

                {subs && subLabels && (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#E8E4DE" }}>
                    {Object.entries(subs).map(([key, val]) => {
                      const subSt = getStatusInfo(val as number);
                      return (
                        <View key={key}>
                          <View style={s.subRow}>
                            <Text style={s.subLabel}>{subLabels[key] ?? key}</Text>
                            <Text style={s.subValue}>{(val as number).toFixed(1)}</Text>
                          </View>
                          <View style={s.subBar}>
                            <View style={{ height: 3, width: `${((val as number) / 10) * 100}%`, backgroundColor: subSt.color, borderRadius: 1 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {summary && <Text style={s.summaryText}>{summary}</Text>}
              </View>
            );
          })}
        </View>

        {/* Radar Chart */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <RadarChartSvg averages={pillarAverages} labels={pillarLabels} />
        </View>
      </Page>

      {/* Page 2 — Pillar Analysis */}
      <Page size="A4" style={s.page}>
        <PageHeader />
        <PageFooter />

        <Text style={{ ...s.label, marginBottom: 20 }}>
          {(t.diagnostico.results as any).analysisSectionTitle ?? "Analise por Pilar"}
        </Text>

        {PILLAR_ORDER.map((pillar) => {
          const pst = getStatusInfo(pillarAverages[pillar]);
          const pi = t.diagnostico.pillars[pillar];
          const weakSub = weakestSubgroupPerPillar[pillar];
          const analysis = getAnalysis(t, pillar, pst.key, weakSub);
          if (!analysis) return null;

          return (
            <View key={pillar} style={{ marginBottom: 24 }} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Text style={{ fontFamily: "Lora", fontSize: 18, fontWeight: 600, color: C.gold }}>{pi.letter}</Text>
                <View>
                  <Text style={s.analysisTitle}>{pi.name}</Text>
                  <Text style={{ ...s.analysisStatus, color: pst.color }}>
                    {t.diagnostico.results.status[pst.key]}
                  </Text>
                </View>
              </View>
              <View style={{ width: 24, height: 0.5, backgroundColor: "rgba(184,168,138,0.3)", marginBottom: 8 }} />
              <Text style={s.analysisBody}>{analysis}</Text>
            </View>
          );
        })}
      </Page>

      {/* Page 3 — Weakest Pillar + Alert + Disclaimer */}
      <Page size="A4" style={s.page}>
        <PageHeader />
        <PageFooter />

        {/* Weakest Pillar */}
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text style={s.label}>{t.diagnostico.results.weakestLabel}</Text>
          <Text style={s.weakLetter}>{weakestData.letter}</Text>
          <Text style={s.weakName}>{weakestData.name}</Text>
          <Text style={s.weakText}>{weakestAdvice.text}</Text>
          <View style={s.divider} />
          <Text style={s.verse}>{weakestAdvice.verse}</Text>
        </View>

        {/* Emotional Alert */}
        {pillarAverages.G < 5.5 && pillarSubgroups.G.emotional < 4.0 && (
          <View style={{ alignItems: "center", paddingTop: 20, borderTopWidth: 0.5, borderTopColor: C.border }} wrap={false}>
            <Text style={s.label}>{t.diagnostico.emotionalAlert.label}</Text>
            <View style={s.divider} />
            <Text style={{ ...s.weakText, maxWidth: 420 }}>{t.diagnostico.emotionalAlert.text}</Text>
          </View>
        )}

        {/* Disclaimer */}
        <Text style={s.disclaimer}>
          {(t.diagnostico as any).intro?.disclaimer ??
            "Este diagnostico e uma ferramenta de reflexao. Os resultados sao um ponto de partida para conversa com um mentor."}
        </Text>
      </Page>
    </Document>
  );
}
