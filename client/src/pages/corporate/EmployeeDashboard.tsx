import { useCorporate } from "@/contexts/CorporateContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { Link } from "wouter";

export default function EmployeeDashboard() {
  const { orgName, orgSlug } = useCorporate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo ao Diagnóstico Corporativo</h1>
        <p className="text-muted-foreground text-sm">{orgName}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <ClipboardList className="h-12 w-12 text-[#B8A88A]" />
          <h2 className="text-lg font-semibold">Diagnóstico P.A.G.O. Corporativo</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Responda o diagnóstico para avaliar os 4 pilares (Princípio, Alinhamento, Governo, Obediência) no contexto da sua organização.
          </p>
          <Link href={`/corporate/${orgSlug}/diagnostico`}>
            <Button>Iniciar Diagnóstico</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
