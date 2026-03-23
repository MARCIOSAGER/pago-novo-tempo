import { useCorporate } from "@/contexts/CorporateContext";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function EmployeeDiagnostico() {
  const { orgName } = useCorporate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Diagnóstico Corporativo</h1>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Em Construção</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            O questionário corporativo será disponibilizado em breve. As perguntas estão sendo elaboradas especificamente para o contexto empresarial.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
