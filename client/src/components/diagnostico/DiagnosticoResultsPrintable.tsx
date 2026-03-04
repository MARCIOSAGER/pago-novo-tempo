import { forwardRef } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStatusInfo } from "./useDiagnosticoReducer";
import type { PillarKey, PillarSubgroups } from "./useDiagnosticoReducer";

interface PrintableProps {
  nome: string;
  pillarAverages: Record<PillarKey, number>;
  overallAverage: number;
  weakestPillar: PillarKey;
  chartData: { pillar: string; value: number; fullMark: number }[];
  pillarSubgroups: PillarSubgroups;
  weakestSubgroupPerPillar: Record<PillarKey, string | null>;
}

const PILLAR_ORDER: PillarKey[] = ["P", "A", "G", "O"];

const DiagnosticoResultsPrintable = forwardRef<HTMLDivElement, PrintableProps>(
  (
    {
      nome,
      pillarAverages,
      overallAverage,
      weakestPillar,
      chartData,
      pillarSubgroups,
      weakestSubgroupPerPillar,
    },
    ref
  ) => {
    const { t } = useLanguage();

    const overallStatus = getStatusInfo(overallAverage);
    const overallStatusLabel = t.diagnostico.results.status[overallStatus.key];
    const weakestData = t.diagnostico.pillars[weakestPillar];
    const weakestAdvice = t.diagnostico.results.pillarAdvice[weakestPillar];

    const radarData = chartData.map((d) => ({
      ...d,
      name: t.diagnostico.pillars[d.pillar as PillarKey].name,
    }));

    // Helper to get summary for a pillar
    const getSummary = (pillar: PillarKey): string | null => {
      const analysis = (t.diagnostico.results as any).pillarAnalysis;
      if (!analysis) return null;
      const pillarBlock = analysis[pillar];
      if (!pillarBlock) return null;
      const status = getStatusInfo(pillarAverages[pillar]);
      const statusBlock = pillarBlock[status.key];
      if (!statusBlock) return null;
      if (pillar === "P") return statusBlock.summary ?? null;
      const weakSub = weakestSubgroupPerPillar[pillar];
      if (!weakSub) return null;
      return statusBlock[weakSub]?.summary ?? null;
    };

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          fontFamily: "Lora, serif",
          backgroundColor: "#FFFFFF",
          color: "#1A2744",
        }}
      >
        {/* Section 1 — Greeting + Overall Score */}
        <div style={{ textAlign: "center", padding: "48px 40px 36px" }}>
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "#B8A88A",
              marginBottom: "16px",
            }}
          >
            {t.diagnostico.results.label}
          </p>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "28px",
              fontWeight: 600,
              color: "#1A2744",
              marginBottom: "4px",
            }}
          >
            {t.diagnostico.results.greeting} {nome}.
          </h2>
          <p
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "18px",
              color: "#B8A88A",
              fontStyle: "italic",
              marginBottom: "24px",
            }}
          >
            {t.diagnostico.results.subtitle}
          </p>

          <div
            style={{
              width: "48px",
              height: "1px",
              backgroundColor: "#B8A88A",
              margin: "0 auto 24px",
            }}
          />

          <div style={{ marginBottom: "8px" }}>
            <span
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "56px",
                fontWeight: 600,
                color: "#1A2744",
              }}
            >
              {overallAverage.toFixed(1)}
            </span>
          </div>
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "#1A2744",
              opacity: 0.5,
              marginBottom: "8px",
            }}
          >
            {t.diagnostico.results.overallLabel}
          </p>
          <span
            style={{
              display: "inline-block",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              padding: "4px 12px",
              border: `1px solid ${overallStatus.color}`,
              color: overallStatus.color,
            }}
          >
            {overallStatusLabel}
          </span>
        </div>

        {/* Section 2 — Pillar Cards (2x2 grid) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            padding: "20px 40px",
          }}
        >
          {PILLAR_ORDER.map((pillar) => {
            const pillarData = t.diagnostico.pillars[pillar];
            const status = getStatusInfo(pillarAverages[pillar]);
            const statusLabel = t.diagnostico.results.status[status.key];
            const progressPercent = (pillarAverages[pillar] / 10) * 100;
            const subgroups =
              pillar !== "P" && pillarSubgroups
                ? pillarSubgroups[pillar as "A" | "G" | "O"]
                : null;
            const subLabels = (pillarData as any).subgroupLabels as
              | Record<string, string>
              | undefined;
            const summary = getSummary(pillar);

            return (
              <div
                key={pillar}
                className="pdf-no-break"
                style={{
                  backgroundColor: "#F9F8F6",
                  padding: "22px",
                  border: "1px solid #E8E4DE",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "28px",
                        fontWeight: 600,
                        color: "#B8A88A",
                      }}
                    >
                      {pillarData.letter}
                    </span>
                    <h3
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1A2744",
                        marginTop: "2px",
                      }}
                    >
                      {pillarData.name}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#1A2744",
                    }}
                  >
                    {pillarAverages[pillar].toFixed(1)}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: "3px",
                    backgroundColor: "#E8E4DE",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </div>

                {/* Status badge */}
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    padding: "2px 8px",
                    border: `1px solid ${status.color}`,
                    color: status.color,
                  }}
                >
                  {statusLabel}
                </span>

                {/* Subgroup mini-bars */}
                {subgroups && subLabels && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(26,39,68,0.1)",
                    }}
                  >
                    {Object.entries(subgroups).map(([key, valor]) => {
                      const subStatus = getStatusInfo(valor as number);
                      return (
                        <div key={key} style={{ marginBottom: "6px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "2px",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.2em",
                                color: "rgba(26,39,68,0.5)",
                              }}
                            >
                              {subLabels[key] ?? key}
                            </span>
                            <span
                              style={{
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "8px",
                                color: "rgba(26,39,68,0.5)",
                              }}
                            >
                              {(valor as number).toFixed(1)}
                            </span>
                          </div>
                          <div
                            style={{
                              height: "3px",
                              backgroundColor: "rgba(232,228,222,0.6)",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${((valor as number) / 10) * 100}%`,
                                backgroundColor: subStatus.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary (always visible in PDF) */}
                {summary && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(26,39,68,0.1)",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Lora, serif",
                        fontSize: "11px",
                        color: "rgba(26,39,68,0.6)",
                        lineHeight: "1.6",
                      }}
                    >
                      {summary}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section 3 — Radar Chart */}
        <div
          className="pdf-no-break"
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "32px 40px",
          }}
        >
          <RadarChart
            width={380}
            height={380}
            data={radarData}
            cx="50%"
            cy="50%"
            outerRadius="65%"
          >
            <PolarGrid
              stroke="#B8A88A"
              strokeOpacity={0.3}
              radialLines={false}
            />
            <PolarAngleAxis
              dataKey="name"
              tick={{
                fill: "#1A2744",
                fontSize: 13,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 500,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="P.A.G.O."
              dataKey="value"
              stroke="#B8A88A"
              strokeWidth={2}
              fill="#B8A88A"
              fillOpacity={0.2}
              dot={{
                r: 4,
                fill: "#FFFFFF",
                stroke: "#B8A88A",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </div>

        {/* Section 4 — Pillar Analysis */}
        <div style={{ padding: "24px 40px", pageBreakBefore: "always" as const }}>
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "#B8A88A",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            {(t.diagnostico.results as any).analysisSectionTitle ??
              "Análise por Pilar"}
          </p>

          {PILLAR_ORDER.map((pillar) => {
            const pillarStatus = getStatusInfo(pillarAverages[pillar]);
            const pillarI18n = t.diagnostico.pillars[pillar];
            const weakSub = weakestSubgroupPerPillar[pillar];

            const analysisBlock = (t.diagnostico.results as any)
              .pillarAnalysis;
            if (!analysisBlock) return null;
            const pBlock = analysisBlock[pillar];
            if (!pBlock) return null;
            const sBlock = pBlock[pillarStatus.key];
            if (!sBlock) return null;
            const textData =
              pillar === "P" ? sBlock : weakSub ? sBlock[weakSub] : null;
            if (!textData?.analysis) return null;

            return (
              <div key={pillar} style={{ marginBottom: "36px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "#B8A88A",
                    }}
                  >
                    {pillarI18n.letter}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1A2744",
                      }}
                    >
                      {pillarI18n.name}
                    </h3>
                    <span
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        color: pillarStatus.color,
                      }}
                    >
                      {t.diagnostico.results.status[pillarStatus.key]}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: "32px",
                    height: "1px",
                    backgroundColor: "rgba(184,168,138,0.3)",
                    marginBottom: "12px",
                  }}
                />

                <p
                  style={{
                    fontFamily: "Lora, serif",
                    fontSize: "12px",
                    color: "rgba(26,39,68,0.6)",
                    lineHeight: "1.8",
                    whiteSpace: "pre-line",
                    textAlign: "justify",
                  }}
                >
                  {textData.analysis}
                </p>
              </div>
            );
          })}
        </div>

        {/* Section 5 — Weakest Pillar */}
        <div
          className="pdf-no-break"
          style={{
            textAlign: "center",
            padding: "40px",
            borderTop: "1px solid #E8E4DE",
          }}
        >
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "#B8A88A",
              marginBottom: "20px",
            }}
          >
            {t.diagnostico.results.weakestLabel}
          </p>

          <span
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "48px",
              fontWeight: 600,
              color: "#B8A88A",
            }}
          >
            {weakestData.letter}
          </span>
          <h3
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "24px",
              fontWeight: 600,
              color: "#1A2744",
              marginTop: "4px",
              marginBottom: "20px",
            }}
          >
            {weakestData.name}
          </h3>

          <p
            style={{
              fontFamily: "Lora, serif",
              fontSize: "13px",
              color: "rgba(26,39,68,0.7)",
              lineHeight: "1.7",
              maxWidth: "560px",
              margin: "0 auto 20px",
              textAlign: "justify",
            }}
          >
            {weakestAdvice.text}
          </p>

          <div
            style={{
              width: "48px",
              height: "1px",
              backgroundColor: "#B8A88A",
              margin: "0 auto 16px",
            }}
          />

          <p
            style={{
              fontFamily: "Lora, serif",
              fontSize: "12px",
              color: "#B8A88A",
              fontStyle: "italic",
            }}
          >
            {weakestAdvice.verse}
          </p>
        </div>

        {/* Section 6 — Emotional Alert (conditional) */}
        {pillarAverages.G < 5.5 && pillarSubgroups.G.emotional < 4.0 && (
          <div
            className="pdf-no-break"
            style={{
              textAlign: "center",
              padding: "40px",
              borderTop: "1px solid #E8E4DE",
            }}
          >
            <p
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.4em",
                color: "#B8A88A",
                marginBottom: "16px",
              }}
            >
              {t.diagnostico.emotionalAlert.label}
            </p>

            <div
              style={{
                width: "48px",
                height: "1px",
                backgroundColor: "#B8A88A",
                margin: "0 auto 20px",
              }}
            />

            <p
              style={{
                fontFamily: "Lora, serif",
                fontSize: "13px",
                color: "rgba(26,39,68,0.7)",
                lineHeight: "1.7",
                maxWidth: "560px",
                margin: "0 auto",
                whiteSpace: "pre-line",
                textAlign: "justify",
              }}
            >
              {t.diagnostico.emotionalAlert.text}
            </p>
          </div>
        )}

        {/* Footer spacing — actual footer is rendered by jsPDF on every page */}
        <div style={{ height: "16px" }} />
      </div>
    );
  }
);

DiagnosticoResultsPrintable.displayName = "DiagnosticoResultsPrintable";

export default DiagnosticoResultsPrintable;
