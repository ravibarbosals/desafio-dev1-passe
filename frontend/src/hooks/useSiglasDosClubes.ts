import { useQuery } from "@tanstack/react-query";

import { consultaDosClubes } from "@/api/clube";

// A partida e a classificação trazem só o id e o nome do clube; a sigla (L01, L03, L05) vem de
// GET /clubs, a mesma consulta do menu, já em cache
export function useSiglasDosClubes(): Map<number, string> {
  const clubes = useQuery(consultaDosClubes());
  return new Map(clubes.data?.map((clube) => [clube.id, clube.acronym]));
}
