import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

import type { ResumoDoClube } from "@/api/clube";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { formatarMoeda } from "@/lib/formatacao";

// "Ver clube" entra com a página do clube (TASK-049)
const colunas: ColunaDaTabela<ResumoDoClube>[] = [
  { titulo: "Clube", celula: (clube) => <span className="font-medium">{clube.name}</span> },
  { titulo: "Sigla", celula: (clube) => <Badge variant="outline">{clube.acronym}</Badge> },
  { titulo: "Caixa", celula: (clube) => formatarMoeda(clube.cash), alinharADireita: true },
  {
    titulo: "Valor do elenco",
    celula: (clube) => formatarMoeda(clube.squad_value),
    alinharADireita: true,
  },
  {
    titulo: "Patrimônio",
    celula: (clube) => <span className="font-semibold">{formatarMoeda(clube.net_worth)}</span>,
    alinharADireita: true,
  },
];

interface PropriedadesTabelaDeClubes {
  consulta: UseQueryResult<ResumoDoClube[]>;
  acaoVazio?: ReactNode;
}

// F05: as linhas na ordem devolvida pela API; a tela não reordena
export function TabelaDeClubes({ consulta, acaoVazio }: PropriedadesTabelaDeClubes) {
  return (
    <TabelaComEstados
      colunas={colunas}
      linhas={consulta.data}
      chave={(clube) => clube.id}
      consulta={consulta}
      textos={{
        carregando: "Carregando clubes…",
        erro: "Não foi possível carregar os clubes",
        vazio: "Nenhum clube cadastrado",
        vazioDescricao: "Crie o primeiro clube para começar a montar a liga.",
      }}
      acaoVazio={acaoVazio}
    />
  );
}
