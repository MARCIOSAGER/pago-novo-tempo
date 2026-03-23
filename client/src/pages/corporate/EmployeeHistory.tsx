import { useCorporate } from "@/contexts/CorporateContext";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";

export default function EmployeeHistory() {
  const { orgName } = useCorporate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Histórico de Evolução</h1>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <History className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Seu histórico aparecerá aqui conforme você completar diagnósticos ao longo do tempo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
