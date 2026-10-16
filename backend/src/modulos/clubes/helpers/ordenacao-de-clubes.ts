import { compararNomes } from '@/core/comum/texto/texto';
import type { Clube } from '@/modulos/clubes/entities/clube.entity';

// Valores do sort de GET /clubs ("Filtros e query params aceitos"): um só
export const ORDENACOES_DE_CLUBES = ['name', 'net_worth_asc', 'net_worth_desc'] as const;
export type OrdenacaoDeClubes = (typeof ORDENACOES_DE_CLUBES)[number];

// O patrimônio já calculado (em centavos) vai junto, para ordenar sem recalcular
export interface ClubeDaListagem {
  clube: Pick<Clube, 'id' | 'nome'>;
  patrimonio: number;
}

type Comparador = (a: ClubeDaListagem, b: ClubeDaListagem) => number;

const COMPARADORES: Record<OrdenacaoDeClubes, Comparador> = {
  name: () => 0,
  net_worth_asc: (a, b) => a.patrimonio - b.patrimonio,
  net_worth_desc: (a, b) => b.patrimonio - a.patrimonio,
};

// RN11: em qualquer ordenação, o empate é desfeito pelo nome (ordem alfabética) e depois pelo id crescente
export function criarComparadorDeClubes(ordenacao: OrdenacaoDeClubes): Comparador {
  return (a, b) => COMPARADORES[ordenacao](a, b) || compararNomes(a.clube.nome, b.clube.nome) || a.clube.id - b.clube.id;
}
