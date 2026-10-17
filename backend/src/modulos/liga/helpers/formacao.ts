import type { PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

// RN19: as 4 formações aceitas, contando os 4 jogadores de linha por setor, de trás para frente
export const FORMACOES = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;
export type Formacao = (typeof FORMACOES)[number];

interface Setores {
  defesa: number;
  meio: number;
  ataque: number;
}

const SETORES_DA_FORMACAO: Record<Formacao, Setores> = {
  '3-1': { defesa: 3, meio: 0, ataque: 1 },
  '2-2': { defesa: 2, meio: 0, ataque: 2 },
  '2-1-1': { defesa: 2, meio: 1, ataque: 1 },
  '1-2-1': { defesa: 1, meio: 2, ataque: 1 },
};

function contar(posicoes: PosicaoJogador[], ...procuradas: PosicaoJogador[]): number {
  return posicoes.filter((posicao) => procuradas.includes(posicao)).length;
}

// RN19.4: exatamente 1 GOL e, em cada setor, a quantidade da formação (defesa = ZAG ou LAT)
export function posicoesFechamAFormacao(formacao: Formacao, posicoes: PosicaoJogador[]): boolean {
  const setores = SETORES_DA_FORMACAO[formacao];
  return contar(posicoes, 'GOL') === 1 && contar(posicoes, 'ZAG', 'LAT') === setores.defesa && contar(posicoes, 'MEI') === setores.meio && contar(posicoes, 'ATA') === setores.ataque;
}
