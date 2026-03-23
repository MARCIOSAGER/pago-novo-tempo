import { useCorporate } from "@/contexts/CorporateContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, TrendingUp, AlertTriangle } from "lucide-react";

export default function HRDashboard() {
  const { orgName } = useCorporate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Painel RH</h1>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Membros Ativos", value: "—" },
          { icon: ClipboardList, label: "Diagnósticos", value: "—" },
          { icon: TrendingUp, label: "Taxa de Conclusão", value: "—" },
          { icon: AlertTriangle, label: "Pilar Mais Fraco", value: "—" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Os dados do dashboard serão populados conforme os membros completarem seus diagnósticos.
        </CardContent>
      </Card>
    </div>
  );
}
