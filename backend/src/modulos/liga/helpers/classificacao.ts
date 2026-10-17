import { compararNomes } from '@/core/comum/texto/texto';
import type { Clube } from '@/modulos/clubes/entities/clube.entity';
import type { Partida } from '@/modulos/liga/entities/partida.entity';

export type ClubeDaClassificacao = Pick<Clube, 'id' | 'nome'>;
export type PartidaDaClassificacao = Pick<Partida, 'mandanteId' | 'visitanteId' | 'golsMandante' | 'golsVisitante'>;

export interface LinhaDaClassificacao {
  posicao: number;
  clubeId: number;
  nomeClube: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
  pontos: number;
}

function registrarJogo(linha: LinhaDaClassificacao, golsPro: number, golsContra: number): void {
  linha.jogos += 1;
  linha.golsPro += golsPro;
  linha.golsContra += golsContra;
  linha.saldo = linha.golsPro - linha.golsContra;
  if (golsPro > golsContra) {
    linha.vitorias += 1;
  } else if (golsPro === golsContra) {
    linha.empates += 1;
  } else {
    linha.derrotas += 1;
  }
  // RN21.3: vitória 3, empate 1, derrota 0
  linha.pontos = linha.vitorias * 3 + linha.empates;
}

function linhaDoClube(linhas: Map<number, LinhaDaClassificacao>, clubeId: number): LinhaDaClassificacao {
  const linha = linhas.get(clubeId);
  if (!linha) {
    throw new Error(`Partida com clube fora da lista: ${clubeId}`);
  }
  return linha;
}

// RN21.4: pontos, saldo e gols marcados (maior primeiro), depois nome (ordem alfabética) e id
function compararLinhas(a: LinhaDaClassificacao, b: LinhaDaClassificacao): number {
  return b.pontos - a.pontos || b.saldo - a.saldo || b.golsPro - a.golsPro || compararNomes(a.nomeClube, b.nomeClube) || a.clubeId - b.clubeId;
}

// RN21: todos os clubes, inclusive os que não jogaram; calculada a cada consulta, nunca gravada
export function calcularClassificacao(clubes: ClubeDaClassificacao[], partidas: PartidaDaClassificacao[]): LinhaDaClassificacao[] {
  const linhas = new Map<number, LinhaDaClassificacao>();
  for (const clube of clubes) {
    linhas.set(clube.id, { posicao: 0, clubeId: clube.id, nomeClube: clube.nome, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, saldo: 0, pontos: 0 });
  }
  for (const partida of partidas) {
    registrarJogo(linhaDoClube(linhas, partida.mandanteId), partida.golsMandante, partida.golsVisitante);
    registrarJogo(linhaDoClube(linhas, partida.visitanteId), partida.golsVisitante, partida.golsMandante);
  }
  return [...linhas.values()].sort(compararLinhas).map((linha, i) => Object.assign(linha, { posicao: i + 1 }));
}
