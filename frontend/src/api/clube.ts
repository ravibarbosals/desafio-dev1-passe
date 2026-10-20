import { queryOptions } from "@tanstack/react-query";

import type { Jogador } from "@/api/jogadores";
import { api } from "@/lib/api";

// Item de GET /clubs (API.md, Clubes 5.2)
export interface ResumoDoClube {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

// As 4 formações: jogadores de linha de trás para frente; o goleiro fica fora da conta (RN19)
export type Formacao = "3-1" | "2-2" | "2-1-1" | "1-2-1";

// GET /clubs/{id}/lineup (API.md, Liga 5.2); sem escalação, players vem vazio
export interface EscalacaoDoClube {
  club_id: number;
  formation: Formacao | null;
  complete: boolean;
  players: Jogador[];
}

// Contrato do jogador no elenco (API.md, Clubes 5.3): dias e % de multa para uma venda agora
export interface ContratoDoJogador {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface NovaEscalacao {
  formation: Formacao;
  player_ids: number[];
}

export interface JogadorDoElenco extends Jogador {
  contract: ContratoDoJogador;
}

// GET /clubs/{id} (API.md, Clubes 5.3); o elenco vem na ordem da RN11
export interface ClubeDetalhado extends ResumoDoClube {
  players: JogadorDoElenco[];
}

export type OrdemDosClubes = "name" | "net_worth_asc" | "net_worth_desc";

// RN14: no máximo 12 jogadores no elenco
export const limiteDoElenco = 12;

export function consultaDosClubes(ordem: OrdemDosClubes = "name") {
  const parametros = ordem === "name" ? {} : { sort: ordem };
  return queryOptions({
    queryKey: ["clubes", parametros],
    queryFn: async () => (await api.get<ResumoDoClube[]>("/clubs", { params: parametros })).data,
  });
}

// A chave começa com "clubes": quem invalida ["clubes"] (compra, venda, edição) recarrega a página
export function consultaDoClube(id: number) {
  return queryOptions({
    queryKey: ["clubes", id],
    queryFn: async () => (await api.get<ClubeDetalhado>(`/clubs/${id}`)).data,
  });
}

export function consultaDaEscalacao(clubeId: number) {
  return queryOptions({
    queryKey: ["escalacao", clubeId],
    queryFn: async () => (await api.get<EscalacaoDoClube>(`/clubs/${clubeId}/lineup`)).data,
  });
}

// Corpo do POST /clubs (API.md, Clubes 5.1); o clube nasce com 300,00 de caixa
export type NovoClube = Pick<ResumoDoClube, "name" | "acronym">;

export async function criarClube(novoClube: NovoClube): Promise<ResumoDoClube> {
  return (await api.post<ResumoDoClube>("/clubs", novoClube)).data;
}

export async function salvarEscalacao(
  clubeId: number,
  escalacao: NovaEscalacao,
): Promise<EscalacaoDoClube> {
  return (await api.put<EscalacaoDoClube>(`/clubs/${clubeId}/lineup`, escalacao)).data;
}
