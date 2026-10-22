import { Check } from "lucide-react";

import { Badge } from "@/componentes/ui/badge";

// RN15: 0% (fidelidade cumprida), 5% e 10% no meio, 20% com mais de 180 dias
function corDaMulta(percentual: number): string {
  if (percentual === 0) {
    return "border-green-200 bg-green-50 text-green-700";
  }
  if (percentual === 20) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
}

interface PropriedadesSeloDaMulta {
  percentual: number;
}

// O % de multa com cor, no elenco (C05) e na confirmação da venda (V01)
export function SeloDaMulta({ percentual }: PropriedadesSeloDaMulta) {
  return (
    <Badge variant="outline" className={corDaMulta(percentual)}>
      {percentual === 0 && <Check />}
      {percentual}%
    </Badge>
  );
} //
