import { queryOptions } from "@tanstack/react-query";

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

export type OrdemDosClubes = "name" | "net_worth_asc" | "net_worth_desc";

export function consultaDosClubes(ordem: OrdemDosClubes = "name") {
  const parametros = ordem === "name" ? {} : { sort: ordem };
  return queryOptions({
    queryKey: ["clubes", parametros],
    queryFn: async () => (await api.get<ResumoDoClube[]>("/clubs", { params: parametros })).data,
  });
}
