import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Shield } from "lucide-react";
import type { ReactNode } from "react";

import type { ResumoDoClube } from "@/api/clube";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { formatarMoeda } from "@/lib/formatacao";

interface PropriedadesTabelaDeClubes {
  consulta: UseQueryResult<ResumoDoClube[]>;
  cabecalho?: ReactNode;
  acaoVazio?: ReactNode;
}

const colunas: ColunaDaTabela<ResumoDoClube>[] = [
  {
    titulo: "Clube",
    celula: (clube) => (
      <span className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-[0.625rem] font-semibold">
          {clube.acronym}
        </span>
        <span className="font-medium">{clube.name}</span>
      </span>
    ),
  },
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
  {
    titulo: "Ações",
    tituloOculto: true,
    celula: (clube) => (
      <Button asChild variant="ghost" size="sm">
        <Link to="/clubes/$id" params={{ id: String(clube.id) }}>
          Ver clube
          <ChevronRight />
        </Link>
      </Button>
    ),
    alinharADireita: true,
  },
];

// F05: as linhas na ordem devolvida pela API; a tela não reordena
export function TabelaDeClubes({ consulta, cabecalho, acaoVazio }: PropriedadesTabelaDeClubes) {
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
        vazioDescricao:
          "Crie o primeiro clube com nome e sigla. Ele começa com 300,00 em caixa e sem jogadores.",
      }}
      cabecalho={cabecalho}
      iconeVazio={<Shield className="size-5" />}
      acaoVazio={acaoVazio}
    />
  );
}
