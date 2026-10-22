import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HandCoins, Shirt, Users } from "lucide-react";

import type { JogadorDoElenco } from "@/api/clube";
import { AvatarDoJogador } from "@/componentes/jogadores/AvatarDoJogador";
import { SeloDeCondicao } from "@/componentes/jogadores/SeloDeCondicao";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { formatarDataHora, formatarMoeda } from "@/lib/formatacao";

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
        <div className="flex items-center gap-3">
          <AvatarDoJogador id={jogador.id} nome={jogador.name} />
          <span className="font-medium">{jogador.name}</span>
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
      celula: (jogador) => (
        <span className="text-muted-foreground">
          {formatarMoeda(jogador.contract.purchase_value)}
        </span>
      ),
      alinharADireita: true,
    },
    {
      titulo: "Fim da fidelidade",
      celula: (jogador) => {
        // C05: a data em cima e a hora embaixo
        const [data, hora] = formatarDataHora(jogador.contract.loyalty_until).split(" ");
        return (
          <span>
            {data}
            <span className="block text-xs text-muted-foreground">{hora}</span>
          </span>
        );
      },
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
      tituloOculto: true,
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
      cabecalho={
        <div>
          <h2 className="font-semibold">Elenco</h2>
          <p className="text-xs text-muted-foreground">
            Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Contrato calculado para
            uma venda agora.
          </p>
        </div>
      }
      iconeVazio={<Shirt className="size-5" />}
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
