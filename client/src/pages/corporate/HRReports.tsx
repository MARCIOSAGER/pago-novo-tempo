import { useCorporate } from "@/contexts/CorporateContext";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function HRReports() {
  const { orgName } = useCorporate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Em Construção</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Os relatórios por departamento e exportação CSV estarão disponíveis quando houver dados de diagnósticos corporativos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
