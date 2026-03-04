import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ChartConfig } from "@/components/ui/chart";

interface DiagnosticoRadarChartProps {
  data: { pillar: string; value: number; fullMark: number }[];
}

export default function DiagnosticoRadarChart({ data }: DiagnosticoRadarChartProps) {
  const { t } = useLanguage();

  // Map pillar keys to translated names
  const chartData = data.map((d) => ({
    ...d,
    name: t.diagnostico.pillars[d.pillar as "P" | "A" | "G" | "O"].name,
  }));

  const chartConfig: ChartConfig = {
    value: {
      label: "Score",
      color: "#B8A88A",
    },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <ChartContainer config={chartConfig} className="aspect-square">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="#B8A88A"
            strokeOpacity={0.15}
            radialLines={false}
          />
          <PolarAngleAxis
            dataKey="name"
            tick={{
              fill: "#FAFAF8",
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
            fillOpacity={0.25}
            dot={{
              r: 4,
              fill: "#1A2744",
              stroke: "#B8A88A",
              strokeWidth: 2,
            }}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}
