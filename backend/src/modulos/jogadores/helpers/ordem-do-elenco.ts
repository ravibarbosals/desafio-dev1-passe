import { compararNomes } from '@/core/comum/texto/texto';
import type { Jogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

// RN11: de trás para frente, não alfabética
const ORDEM_DAS_POSICOES: Record<PosicaoJogador, number> = { GOL: 1, ZAG: 2, LAT: 3, MEI: 4, ATA: 5 };

export type JogadorDoElenco = Pick<Jogador, 'id' | 'nome' | 'posicao'>;

// Também usada sozinha no sort=position da listagem (RN07), em que o desempate é outro
export function compararPosicoes(a: PosicaoJogador, b: PosicaoJogador): number {
  return ORDEM_DAS_POSICOES[a] - ORDEM_DAS_POSICOES[b];
}

// RN11: posição, depois nome (ordem alfabética), depois id; a mesma ordem no elenco, na escalação e na partida (RN20)
export function compararOrdemDoElenco(a: JogadorDoElenco, b: JogadorDoElenco): number {
  return compararPosicoes(a.posicao, b.posicao) || compararNomes(a.nome, b.nome) || a.id - b.id;
}
