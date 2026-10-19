import type { Condicao, OrdemDosJogadores, Posicao } from "@/api/jogadores";

export const nomesDasPosicoes: Record<Posicao, string> = {
  GOL: "Goleiro",
  LAT: "Lateral",
  ZAG: "Zagueiro",
  MEI: "Meio-campo",
  ATA: "Atacante",
};

export const nomesDasCondicoes: Record<Condicao, string> = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
};

// As 6 ordenações que a API aceita no sort (J15)
export const nomesDasOrdens: Record<OrdemDosJogadores, string> = {
  name: "Nome",
  value_desc: "Maior valor de mercado",
  value_asc: "Menor valor de mercado",
  age_desc: "Maior idade",
  age_asc: "Menor idade",
  position: "Posição (GOL a ATA)",
};
