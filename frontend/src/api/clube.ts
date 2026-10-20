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

// GET /clubs/{id}/lineup (API.md, Liga 5.2); sem escalação, players vem vazio
export interface EscalacaoDoClube {
  club_id: number;
  formation: string | null;
  complete: boolean;
  players: Jogador[];
}

export type OrdemDosClubes = "name" | "net_worth_asc" | "net_worth_desc";

export function consultaDosClubes(ordem: OrdemDosClubes = "name") {
  const parametros = ordem === "name" ? {} : { sort: ordem };
  return queryOptions({
    queryKey: ["clubes", parametros],
    queryFn: async () => (await api.get<ResumoDoClube[]>("/clubs", { params: parametros })).data,
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
