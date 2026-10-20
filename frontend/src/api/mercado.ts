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
