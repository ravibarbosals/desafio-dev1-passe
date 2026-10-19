import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

import type { ResumoDoClube } from "@/api/clube";
import type { Jogador, PaginaDeJogadores } from "@/api/jogadores";
import { Paginacao } from "@/componentes/tabela/Paginacao";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { formatarMoeda } from "@/lib/formatacao";
import { nomesDasCondicoes, nomesDasPosicoes } from "@/lib/rotulos";

import { MenuDoJogador, type AcoesDoJogador } from "./MenuDoJogador";

const coresDasCondicoes: Record<Jogador["condition"], string> = {
  APTO: "border-green-200 bg-green-50 text-green-700",
  MAL_CONDICIONADO: "border-amber-200 bg-amber-50 text-amber-700",
  DOENTE: "border-red-200 bg-red-50 text-red-700",
};

function montarColunas(
  clubesPorId: Map<number, ResumoDoClube>,
  acoes: AcoesDoJogador,
): ColunaDaTabela<Jogador>[] {
  return [
    {
      titulo: "Jogador",
      celula: (jogador) => (
        <div>
          <p className="font-medium">{jogador.name}</p>
          <p className="text-xs text-muted-foreground">{nomesDasPosicoes[jogador.position]}</p>
        </div>
      ),
    },
    {
      titulo: "Posição",
      celula: (jogador) => <Badge variant="outline">{jogador.position}</Badge>,
    },
    {
      titulo: "Overall",
      celula: (jogador) => <span className="font-semibold">{jogador.overall}</span>,
      alinharADireita: true,
    },
    { titulo: "Agilidade", celula: (jogador) => jogador.agility, alinharADireita: true },
    { titulo: "Idade", celula: (jogador) => jogador.age, alinharADireita: true },
    {
      titulo: "Condição",
      celula: (jogador) => (
        <Badge variant="outline" className={coresDasCondicoes[jogador.condition]}>
          {nomesDasCondicoes[jogador.condition]}
        </Badge>
      ),
    },
    {
      titulo: "Valor base",
      celula: (jogador) => formatarMoeda(jogador.base_value),
      alinharADireita: true,
    },
    {
      titulo: "Valor de mercado",
      celula: (jogador) => (
        <span className="font-semibold">{formatarMoeda(jogador.market_value)}</span>
      ),
      alinharADireita: true,
    },
    {
      titulo: "Clube",
      celula: (jogador) => celulaDoClube(jogador.club_id, clubesPorId),
    },
    {
      titulo: "Ações",
      celula: (jogador) => <MenuDoJogador jogador={jogador} {...acoes} />,
      alinharADireita: true,
    },
  ];
}

// O jogador traz só o club_id; a sigla e o nome vêm de GET /clubs
function celulaDoClube(clubeId: number | null, clubesPorId: Map<number, ResumoDoClube>): ReactNode {
  if (clubeId === null) {
    return <Badge variant="secondary">Livre</Badge>;
  }
  const clube = clubesPorId.get(clubeId);
  if (!clube) {
    return "…";
  }
  return (
    <span className="flex items-center gap-2">
      <Badge variant="outline">{clube.acronym}</Badge>
      {clube.name}
    </span>
  );
}

interface PropriedadesTabelaDeJogadores {
  consulta: UseQueryResult<PaginaDeJogadores>;
  clubes: ResumoDoClube[] | undefined;
  textoVazio: string;
  acaoVazio?: ReactNode;
  aoMudarPagina: (pagina: number) => void;
  acoes: AcoesDoJogador;
}

export function TabelaDeJogadores({
  consulta,
  clubes,
  textoVazio,
  acaoVazio,
  aoMudarPagina,
  acoes,
}: PropriedadesTabelaDeJogadores) {
  const clubesPorId = new Map(clubes?.map((clube) => [clube.id, clube]));
  const meta = consulta.data?.meta;

  return (
    <TabelaComEstados
      colunas={montarColunas(clubesPorId, acoes)}
      linhas={consulta.data?.data}
      chave={(jogador) => jogador.id}
      consulta={consulta}
      textos={{
        carregando: "Carregando jogadores…",
        erro: "Não foi possível carregar os jogadores",
        vazio: textoVazio,
        vazioDescricao:
          "Confira a grafia ou tire alguns filtros. A busca ignora maiúsculas, minúsculas e acentos.",
      }}
      acaoVazio={acaoVazio}
      rodape={
        meta && (
          <Paginacao
            pagina={meta.page}
            limite={meta.limit}
            totalItens={meta.total_items}
            totalPaginas={meta.total_pages}
            rotuloItens="jogadores"
            aoMudarPagina={aoMudarPagina}
          />
        )
      }
    />
  );
}
