import { queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type TipoDeTransacao = "COMPRA" | "VENDA";

// Transação do histórico (API.md, Mercado 5.3); profit vem null na compra
export interface Transacao {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TipoDeTransacao;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

// Totais das transações filtradas (RN17), já somados pela API
export interface ResumoDoHistorico {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

// GET /clubs/{id}/transactions (API.md, Mercado 5.3): da mais recente para a mais antiga
export interface HistoricoDoClube {
  data: Transacao[];
  summary: ResumoDoHistorico;
}

// Filtros do histórico e da exportação; sem type, vêm compras e vendas (AM-007)
export interface FiltroDoHistorico {
  type?: TipoDeTransacao;
  player_id?: number;
}

export interface ArquivoCsv {
  nome: string;
  conteudo: string;
}

export interface NovaCompra {
  club_id: number;
  loyalty_until: string;
}

// Resposta da compra: a transação COMPRA, o contrato ATIVO e o caixa depois dela
export interface ResultadoDaCompra extends Transacao {
  contract: { purchase_value: number; loyalty_until: string; status: "ATIVO" };
  club_cash: number;
}

// Resposta do POST /players/{id}/sell (API.md, Mercado 5.2): a transação e o contrato encerrado
export interface ResultadoDaVenda extends Transacao {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: "RESCINDIDO" | "ENCERRADO";
  club_cash: number;
}

// Sem corpo: a API vende pelo valor de mercado do momento (RN16)
export async function venderJogador(id: number): Promise<ResultadoDaVenda> {
  return (await api.post<ResultadoDaVenda>(`/players/${id}/sell`)).data;
}

// O preço é o valor de mercado do momento, calculado pela API (RN12, RN13)
export async function comprarJogador(id: number, compra: NovaCompra): Promise<ResultadoDaCompra> {
  return (await api.post<ResultadoDaCompra>(`/players/${id}/buy`, compra)).data;
}

// A chave começa com "clubes": a compra e a venda já invalidam ["clubes"] e recarregam o histórico
export function consultaDoHistorico(clubeId: number, filtro: FiltroDoHistorico = {}) {
  return queryOptions({
    queryKey: ["clubes", clubeId, "transacoes", filtro],
    queryFn: async () =>
      (await api.get<HistoricoDoClube>(`/clubs/${clubeId}/transactions`, { params: filtro })).data,
  });
}

// "attachment; filename="historico-clube-1.csv"" → "historico-clube-1.csv"
function lerNomeDoArquivo(cabecalho: unknown): string | undefined {
  return typeof cabecalho === "string" ? /filename="([^"]+)"/.exec(cabecalho)?.[1] : undefined;
}

// FLX-007: o CSV vem pronto da API (RN18), com os mesmos filtros da tela. O axios lê o erro como
// JSON, então um 400 ou 404 mostra o message em vez de baixar o erro como se fosse o arquivo
export async function exportarHistorico(
  clubeId: number,
  filtro: FiltroDoHistorico,
): Promise<ArquivoCsv> {
  const resposta = await api.get<string>(`/clubs/${clubeId}/transactions/export`, {
    params: filtro,
  });
  return {
    nome:
      lerNomeDoArquivo(resposta.headers["content-disposition"]) ?? `historico-clube-${clubeId}.csv`,
    conteudo: resposta.data,
  };
}
