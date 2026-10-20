import type { Condicao } from "@/api/jogadores";
import { Badge } from "@/componentes/ui/badge";
import { nomesDasCondicoes } from "@/lib/rotulos";

const coresDasCondicoes: Record<Condicao, string> = {
  APTO: "border-green-200 bg-green-50 text-green-700",
  MAL_CONDICIONADO: "border-amber-200 bg-amber-50 text-amber-700",
  DOENTE: "border-red-200 bg-red-50 text-red-700",
};

interface PropriedadesSeloDeCondicao {
  condicao: Condicao;
}

// A condição com a cor da tabela (J01) e do modal de condição (J10)
export function SeloDeCondicao({ condicao }: PropriedadesSeloDeCondicao) {
  return (
    <Badge variant="outline" className={coresDasCondicoes[condicao]}>
      {nomesDasCondicoes[condicao]}
    </Badge>
  );
}
