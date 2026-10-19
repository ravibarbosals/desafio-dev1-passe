import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type Posicao = "GOL" | "LAT" | "ZAG" | "MEI" | "ATA";
export type Condicao = "APTO" | "MAL_CONDICIONADO" | "DOENTE";

// Corpo do jogador como a API devolve (API.md, Jogadores 5.1); os nomes dos campos são do enunciado
export interface Jogador {
  id: number;
  name: string;
  position: Posicao;
  agility: number;
  age: number;
  condition: Condicao;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export interface PaginaDeJogadores {
  data: Jogador[];
  meta: { page: number; limit: number; total_items: number; total_pages: number };
}

export type OrdemDosJogadores =
  | "name"
  | "value_asc"
  | "value_desc"
  | "age_asc"
  | "age_desc"
  | "position";
export type SituacaoDosJogadores = "todos" | "livres" | "em-clubes";

// Filtros da tela (J01); vazios não filtram
export interface FiltrosDosJogadores {
  busca?: string;
  posicao?: Posicao;
  condicao?: Condicao;
  situacao?: SituacaoDosJogadores;
  clubeId?: number;
  idadeMinima?: number;
  idadeMaxima?: number;
  valorMinimo?: number;
  valorMaximo?: number;
  ordem?: OrdemDosJogadores;
  pagina?: number;
}

// Filtros da tela → query params do GET /players, sem os vazios: a API recusa parâmetro vazio (400)
export function montarParametrosDaListagem(filtros: FiltrosDosJogadores): Record<string, string> {
  const parametros: Record<string, string> = {};
  const busca = filtros.busca?.trim() ?? "";
  // A API exige de 2 a 100 caracteres; com 1, a tela mostra todos até a pessoa digitar mais
  if (busca.length >= 2) {
    parametros.search = busca;
  }
  if (filtros.posicao) {
    parametros.position = filtros.posicao;
  }
  if (filtros.condicao) {
    parametros.condition = filtros.condicao;
  }
  if (filtros.situacao === "livres") {
    parametros.free = "true";
  }
  if (filtros.situacao === "em-clubes") {
    parametros.free = "false";
  }
  // "Livres" desabilita o filtro de clube (J04): free=true com club_id é 400
  if (filtros.clubeId !== undefined && filtros.situacao !== "livres") {
    parametros.club_id = String(filtros.clubeId);
  }
  if (filtros.idadeMinima !== undefined) {
    parametros.min_age = String(filtros.idadeMinima);
  }
  if (filtros.idadeMaxima !== undefined) {
    parametros.max_age = String(filtros.idadeMaxima);
  }
  if (filtros.valorMinimo !== undefined) {
    parametros.min_value = String(filtros.valorMinimo);
  }
  if (filtros.valorMaximo !== undefined) {
    parametros.max_value = String(filtros.valorMaximo);
  }
  if (filtros.ordem && filtros.ordem !== "name") {
    parametros.sort = filtros.ordem;
  }
  if (filtros.pagina !== undefined && filtros.pagina > 1) {
    parametros.page = String(filtros.pagina);
  }
  return parametros;
}

// A chave começa com "jogadores": invalidar ["jogadores"] recarrega todas as páginas e filtros
export function consultaDosJogadores(filtros: FiltrosDosJogadores) {
  const parametros = montarParametrosDaListagem(filtros);
  return queryOptions({
    queryKey: ["jogadores", parametros],
    queryFn: async () =>
      (await api.get<PaginaDeJogadores>("/players", { params: parametros })).data,
    // Mantém a página anterior na tela enquanto a próxima carrega, sem voltar ao esqueleto
    placeholderData: keepPreviousData,
  });
}
