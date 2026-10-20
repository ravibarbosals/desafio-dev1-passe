import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HandCoins, Users } from "lucide-react";

import type { JogadorDoElenco } from "@/api/clube";
import { SeloDeCondicao } from "@/componentes/jogadores/SeloDeCondicao";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { formatarDataHora, formatarMoeda } from "@/lib/formatacao";
import { nomesDasPosicoes } from "@/lib/rotulos";

import { SeloDaMulta } from "./SeloDaMulta";

interface PropriedadesTabelaDoElenco {
  jogadores: JogadorDoElenco[];
  consulta: Pick<UseQueryResult, "isPending" | "isError" | "error" | "refetch">;
  aoVender: (jogador: JogadorDoElenco) => void;
}

// Monta as colunas com a ação de vender da página (V01)
function montarColunas(
  aoVender: (jogador: JogadorDoElenco) => void,
): ColunaDaTabela<JogadorDoElenco>[] {
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
    { titulo: "Posição", celula: (jogador) => <Badge variant="outline">{jogador.position}</Badge> },
    {
      titulo: "Overall",
      celula: (jogador) => <span className="font-semibold">{jogador.overall}</span>,
      alinharADireita: true,
    },
    { titulo: "Condição", celula: (jogador) => <SeloDeCondicao condicao={jogador.condition} /> },
    {
      titulo: "Valor de mercado",
      celula: (jogador) => (
        <span className="font-semibold">{formatarMoeda(jogador.market_value)}</span>
      ),
      alinharADireita: true,
    },
    {
      titulo: "Valor de compra",
      celula: (jogador) => formatarMoeda(jogador.contract.purchase_value),
      alinharADireita: true,
    },
    {
      titulo: "Fim da fidelidade",
      celula: (jogador) => formatarDataHora(jogador.contract.loyalty_until),
    },
    {
      titulo: "Dias restantes",
      celula: (jogador) => jogador.contract.remaining_days.toLocaleString("pt-BR"),
      alinharADireita: true,
    },
    {
      titulo: "% de multa",
      celula: (jogador) => <SeloDaMulta percentual={jogador.contract.penalty_rate} />,
      alinharADireita: true,
    },
    {
      titulo: "Ações",
      celula: (jogador) => (
        <Button type="button" variant="outline" size="sm" onClick={() => aoVender(jogador)}>
          <HandCoins />
          Vender
        </Button>
      ),
      alinharADireita: true,
    },
  ];
}

// F07: o elenco na ordem devolvida pela API, com o contrato calculado para uma venda agora
export function TabelaDoElenco({ jogadores, consulta, aoVender }: PropriedadesTabelaDoElenco) {
  return (
    <TabelaComEstados
      colunas={montarColunas(aoVender)}
      linhas={jogadores}
      chave={(jogador) => jogador.id}
      consulta={consulta}
      textos={{
        carregando: "Carregando elenco…",
        erro: "Não foi possível carregar o elenco",
        vazio: "Nenhum jogador no elenco",
        vazioDescricao:
          "Compre jogadores livres para montar o elenco. O limite é de 12 jogadores, e o custo de cada compra não pode passar de 50% do caixa.",
      }}
      acaoVazio={
        <Button asChild variant="outline">
          <Link to="/jogadores" search={{ situacao: "livres" }}>
            <Users />
            Ver jogadores livres
          </Link>
        </Button>
      }
    />
  );
}
