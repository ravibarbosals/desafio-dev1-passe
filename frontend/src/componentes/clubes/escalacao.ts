import type { Formacao, NovaEscalacao } from "@/api/clube";
import type { Jogador, Posicao } from "@/api/jogadores";
import { nomesDosAtributos } from "@/lib/rotulos";

export type Setor = "GOL" | "DEFESA" | "MEIO" | "ATAQUE";

export const formacoes: Formacao[] = ["3-1", "2-2", "2-1-1", "1-2-1"];

// C07: sem escalação salva, a tela começa na 2-1-1 (nada é gravado até salvar)
export const formacaoInicial: Formacao = "2-1-1";

// RN19: 1 goleiro e os 4 jogadores de linha de cada setor, de trás para frente
export const setoresDaFormacao: Record<Formacao, Setor[]> = {
  "3-1": ["GOL", "DEFESA", "DEFESA", "DEFESA", "ATAQUE"],
  "2-2": ["GOL", "DEFESA", "DEFESA", "ATAQUE", "ATAQUE"],
  "2-1-1": ["GOL", "DEFESA", "DEFESA", "MEIO", "ATAQUE"],
  "1-2-1": ["GOL", "DEFESA", "MEIO", "MEIO", "ATAQUE"],
};

export const descricoesDasFormacoes: Record<Formacao, string> = {
  "3-1": "Defesa 3, ataque 1",
  "2-2": "Defesa 2, ataque 2",
  "2-1-1": "Defesa 2, meio 1, ataque 1",
  "1-2-1": "Defesa 1, meio 2, ataque 1",
};

// A vaga de defesa aceita zagueiro ou lateral
export const posicoesDoSetor: Record<Setor, Posicao[]> = {
  GOL: ["GOL"],
  DEFESA: ["ZAG", "LAT"],
  MEIO: ["MEI"],
  ATAQUE: ["ATA"],
};

export const nomesDosSetores: Record<Setor, string> = {
  GOL: "Goleiro",
  DEFESA: "Defesa",
  MEIO: "Meio",
  ATAQUE: "Ataque",
};

// Um id por vaga, na ordem de setoresDaFormacao; undefined = vaga vazia
export type Titulares = (number | undefined)[];

// Põe cada jogador na primeira vaga livre do setor dele, na ordem recebida (a do elenco). Serve
// para a escalação salva (C11: o titular vendido deixa a vaga vazia) e para a troca de formação,
// em que as vagas que deixam de existir ficam de fora
export function distribuirTitulares(formacao: Formacao, jogadores: Jogador[]): Titulares {
  const usados = new Set<number>();
  return setoresDaFormacao[formacao].map((setor) => {
    const jogador = jogadores.find(
      (candidato) =>
        !usados.has(candidato.id) && posicoesDoSetor[setor].includes(candidato.position),
    );
    if (jogador) {
      usados.add(jogador.id);
    }
    return jogador?.id;
  });
}

// Opções da vaga: do elenco, da posição do setor, sem DOENTE (permitido impedir: E "Liga") e sem
// quem já está em outra vaga (os 5 ids são distintos)
export function listarOpcoesDaVaga(
  elenco: Jogador[],
  titulares: Titulares,
  indice: number,
  formacao: Formacao,
): Jogador[] {
  const setor = setoresDaFormacao[formacao][indice];
  return elenco.filter(
    (jogador) =>
      posicoesDoSetor[setor].includes(jogador.position) &&
      jogador.condition !== "DOENTE" &&
      !titulares.some((id, outro) => id === jogador.id && outro !== indice),
  );
}

// Corpo do PUT só com as 5 vagas preenchidas; senão undefined, e o Salvar fica desabilitado (C07)
export function montarEscalacao(
  formacao: Formacao,
  titulares: Titulares,
): NovaEscalacao | undefined {
  const ids = titulares.filter((id) => id !== undefined);
  return ids.length === setoresDaFormacao[formacao].length
    ? { formation: formacao, player_ids: ids }
    : undefined;
}

// Os atributos que a partida usa (RN20): ataque pela posição, defesa sempre pelo defending
export function listarAtributosUsados(jogador: Jogador): { nome: string; valor: number }[] {
  switch (jogador.position) {
    case "GOL":
      return [{ nome: nomesDosAtributos.defending, valor: jogador.defending }];
    case "ZAG":
    case "LAT":
      return [
        { nome: nomesDosAtributos.dribbling, valor: jogador.dribbling },
        { nome: nomesDosAtributos.defending, valor: jogador.defending },
      ];
    case "MEI":
      return [{ nome: nomesDosAtributos.passing, valor: jogador.passing }];
    case "ATA":
      return [{ nome: nomesDosAtributos.shooting, valor: jogador.shooting }];
  }
}
