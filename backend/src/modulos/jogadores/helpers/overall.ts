import { arredondarMeioParaCima } from '@/core/comum/arredondamento/arredondamento';
import type { Jogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

export type AtributosJogador = Pick<Jogador, 'velocidade' | 'finalizacao' | 'passe' | 'drible' | 'defesa' | 'fisico'>;

// Tabela de pesos da RN06, em %; os pesos de cada posição somam 100
const PESOS_POR_POSICAO: Record<PosicaoJogador, AtributosJogador> = {
  GOL: { velocidade: 10, finalizacao: 0, passe: 20, drible: 0, defesa: 40, fisico: 30 },
  ZAG: { velocidade: 10, finalizacao: 0, passe: 15, drible: 0, defesa: 45, fisico: 30 },
  LAT: { velocidade: 25, finalizacao: 0, passe: 20, drible: 15, defesa: 25, fisico: 15 },
  MEI: { velocidade: 10, finalizacao: 15, passe: 35, drible: 25, defesa: 5, fisico: 10 },
  ATA: { velocidade: 20, finalizacao: 40, passe: 10, drible: 20, defesa: 0, fisico: 10 },
};

export interface DadosOverall {
  posicao: PosicaoJogador;
  atributos: AtributosJogador;
}

// RN06: soma dos atributos × peso da posição, ÷ 100, inteiro com meio para cima; calculado a cada consulta, com a posição atual
export function calcularOverall({ posicao, atributos }: DadosOverall): number {
  const pesos = PESOS_POR_POSICAO[posicao];
  const soma =
    atributos.velocidade * pesos.velocidade +
    atributos.finalizacao * pesos.finalizacao +
    atributos.passe * pesos.passe +
    atributos.drible * pesos.drible +
    atributos.defesa * pesos.defesa +
    atributos.fisico * pesos.fisico;
  return arredondarMeioParaCima(soma, 100);
}
