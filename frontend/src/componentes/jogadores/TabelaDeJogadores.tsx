import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";

import type { ResumoDoClube } from "@/api/clube";
import type { Jogador, PaginaDeJogadores } from "@/api/jogadores";
import { Paginacao } from "@/componentes/tabela/Paginacao";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { formatarMoeda } from "@/lib/formatacao";
import { nomesDasPosicoes } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

import { AvatarDoJogador } from "./AvatarDoJogador";
import { MenuDoJogador, type AcoesDoJogador } from "./MenuDoJogador";
import { SeloDeCondicao } from "./SeloDeCondicao";

interface PropriedadesTabelaDeJogadores {
  consulta: UseQueryResult<PaginaDeJogadores>;
  clubes: ResumoDoClube[] | undefined;
  textoVazio: string;
  acaoVazio?: ReactNode;
  aoMudarPagina: (pagina: number) => void;
  acoes: AcoesDoJogador;
}

function montarColunas(
  clubesPorId: Map<number, ResumoDoClube>,
  acoes: AcoesDoJogador,
): ColunaDaTabela<Jogador>[] {
  return [
    {
      titulo: "Jogador",
      celula: (jogador) => (
        <div className="flex items-center gap-3">
          <AvatarDoJogador id={jogador.id} nome={jogador.name} />
          <div>
            <p className="font-medium">{jogador.name}</p>
            <p className="text-xs text-muted-foreground">{nomesDasPosicoes[jogador.position]}</p>
          </div>
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
    {
      titulo: "Agilidade",
      celula: (jogador) => <BarraDeAgilidade agilidade={jogador.agility} />,
    },
    { titulo: "Idade", celula: (jogador) => jogador.age, alinharADireita: true },
    {
      titulo: "Condição",
      celula: (jogador) => <SeloDeCondicao condicao={jogador.condition} />,
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
      tituloOculto: true,
      celula: (jogador) => (
        <div className="flex items-center justify-end gap-1">
          {/* Só jogador livre pode ser comprado (RN12) */}
          {jogador.club_id === null && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => acoes.aoComprar(jogador)}
            >
              <ShoppingCart />
              Comprar
            </Button>
          )}
          <MenuDoJogador jogador={jogador} {...acoes} />
        </div>
      ),
      alinharADireita: true,
    },
  ];
}

// RN do valor de mercado: de 1 a 30 e de 80 a 100 a agilidade muda o desconto da condição
function BarraDeAgilidade({ agilidade }: { agilidade: number }) {
  const cor =
    agilidade <= 30 ? "bg-red-500" : agilidade >= 80 ? "bg-green-600" : "bg-muted-foreground";
  return (
    <span className="flex items-center gap-2">
      <span className="w-6 text-right">{agilidade}</span>
      <span aria-hidden className="h-1.5 w-8 overflow-hidden rounded-full bg-muted">
        <span className={cn("block h-full rounded-full", cor)} style={{ width: `${agilidade}%` }} />
      </span>
    </span>
  );
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
      <Link
        to="/clubes/$id"
        params={{ id: String(clube.id) }}
        className="underline underline-offset-4 hover:text-primary"
      >
        {clube.name}
      </Link>
    </span>
  );
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
