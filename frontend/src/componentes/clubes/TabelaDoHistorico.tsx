import type { UseQueryResult } from "@tanstack/react-query";
import { HandCoins, ShoppingCart } from "lucide-react";

import type { Transacao } from "@/api/mercado";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { ValorComSinal } from "@/componentes/ValorComSinal";
import { formatarDataHora, formatarMoeda } from "@/lib/formatacao";

// Valores e nome do momento de cada operação, como a API devolve (RN17)
const colunas: ColunaDaTabela<Transacao>[] = [
  { titulo: "Data e hora", celula: (transacao) => formatarDataHora(transacao.created_at) },
  {
    titulo: "Tipo",
    celula: (transacao) => (
      <Badge variant="outline">
        {transacao.type === "COMPRA" ? <ShoppingCart /> : <HandCoins />}
        {transacao.type === "COMPRA" ? "Compra" : "Venda"}
      </Badge>
    ),
  },
  {
    titulo: "Jogador",
    celula: (transacao) => <span className="font-medium">{transacao.player_name}</span>,
  },
  {
    titulo: "Valor",
    celula: (transacao) => formatarMoeda(transacao.value),
    alinharADireita: true,
  },
  {
    titulo: "Taxa ou comissão",
    celula: (transacao) => formatarMoeda(transacao.fee),
    alinharADireita: true,
  },
  {
    titulo: "Multa",
    celula: (transacao) => formatarMoeda(transacao.penalty),
    alinharADireita: true,
  },
  {
    titulo: "Lucro",
    // A compra não tem lucro (profit null)
    celula: (transacao) =>
      transacao.profit === null ? (
        <span className="text-muted-foreground">–</span>
      ) : (
        <ValorComSinal valor={transacao.profit} />
      ),
    alinharADireita: true,
  },
  {
    titulo: "Variação do caixa",
    celula: (transacao) => (
      <ValorComSinal valor={transacao.cash_change} className="font-semibold" />
    ),
    alinharADireita: true,
  },
];

interface PropriedadesTabelaDoHistorico {
  transacoes: Transacao[] | undefined;
  consulta: Pick<UseQueryResult, "isPending" | "isError" | "error" | "refetch">;
  // Com filtro, o vazio diz que nenhuma transação atende; sem filtro, que o clube não tem nenhuma
  filtrado: boolean;
}

// F09: tabela do histórico, com carregando, erro (E05) e vazio (H04)
export function TabelaDoHistorico({
  transacoes,
  consulta,
  filtrado,
}: PropriedadesTabelaDoHistorico) {
  return (
    <TabelaComEstados
      colunas={colunas}
      linhas={transacoes}
      chave={(transacao) => transacao.id}
      consulta={consulta}
      textos={{
        carregando: "Carregando histórico…",
        erro: "Não foi possível carregar o histórico",
        vazio: filtrado ? "Nenhuma transação com esses filtros" : "Nenhuma transação ainda",
        vazioDescricao: filtrado
          ? "Mude ou limpe os filtros para ver as outras transações do clube."
          : "As compras e vendas do clube aparecem aqui, com os totais logo abaixo.",
      }}
    />
  );
}
