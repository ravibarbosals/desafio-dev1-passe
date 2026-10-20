import { queryOptions } from "@tanstack/react-query";

import type { Formacao } from "@/api/clube";
import type { Condicao, Posicao } from "@/api/jogadores";
import { api } from "@/lib/api";

export type ResultadoDaPartida = "MANDANTE" | "VISITANTE" | "EMPATE";
export type AtributoDoDuelo = "shooting" | "passing" | "dribbling" | "defending";

// Mandante ou visitante, com a formação e os gols gravados na partida (RN20)
export interface LadoDaPartida {
  club_id: number;
  club_name: string;
  formation: Formacao;
  goals: number;
}

// Atacante ou defensor do duelo: nome, condição e valor do momento, já com o efeito da condição
export interface JogadorDoDuelo {
  player_id: number;
  player_name: string;
  position: Posicao;
  condition: Condicao;
  attribute: AtributoDoDuelo;
  value: number;
}

export interface Duelo {
  order: number;
  attacking_club_id: number;
  attacker: JogadorDoDuelo;
  defender: JogadorDoDuelo;
  goal: boolean;
}

// GET /matches (API.md, Liga 5.4): sem os duelos
export interface ResumoDaPartida {
  id: number;
  played_at: string;
  home: LadoDaPartida;
  away: LadoDaPartida;
  result: ResultadoDaPartida;
}

// POST /matches e GET /matches/{id} (Liga 5.3, 5.5): com os 6 duelos, 1 a 3 do mandante
export interface Partida extends ResumoDaPartida {
  duels: Duelo[];
}

export interface NovaPartida {
  home_club_id: number;
  away_club_id: number;
}

// Da mais recente para a mais antiga (RN21); com clubeId, só as partidas do clube
export function consultaDasPartidas(clubeId?: number) {
  const parametros = clubeId === undefined ? {} : { club_id: clubeId };
  return queryOptions({
    queryKey: ["partidas", parametros],
    queryFn: async () =>
      (await api.get<ResumoDaPartida[]>("/matches", { params: parametros })).data,
  });
}

export function consultaDaPartida(id: number) {
  return queryOptions({
    queryKey: ["partidas", id],
    queryFn: async () => (await api.get<Partida>(`/matches/${id}`)).data,
  });
}

// O placar sai dos atributos dos titulares, calculado pela API (RN20); a tela não recalcula
export async function jogarPartida(partida: NovaPartida): Promise<Partida> {
  return (await api.post<Partida>("/matches", partida)).data;
}
