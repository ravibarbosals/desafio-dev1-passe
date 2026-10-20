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
