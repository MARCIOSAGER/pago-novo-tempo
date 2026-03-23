import { useCorporate } from "@/contexts/CorporateContext";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function EmployeeResults() {
  const { orgName } = useCorporate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meus Resultados</h1>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Nenhum resultado disponível. Complete o diagnóstico primeiro.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
