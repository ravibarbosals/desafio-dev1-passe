import { compararNomes } from '@/core/comum/texto/texto';
import type { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { compararPosicoes } from '@/modulos/jogadores/helpers/ordem-do-elenco';

// Valores do sort de GET /players ("Filtros e query params aceitos")
export const ORDENACOES_DA_LISTAGEM = ['name', 'value_asc', 'value_desc', 'age_asc', 'age_desc', 'position'] as const;
export type OrdenacaoDaListagem = (typeof ORDENACOES_DA_LISTAGEM)[number];

// O valor de mercado já calculado (em centavos) vai junto, para ordenar e filtrar sem recalcular
export interface JogadorDaListagem {
  jogador: Pick<Jogador, 'id' | 'nome' | 'idade' | 'posicao'>;
  valorDeMercado: number;
}

type Comparador = (a: JogadorDaListagem, b: JogadorDaListagem) => number;

// RN07.1 e RN07.2: valor é sempre o de mercado; posição na ordem do elenco, não alfabética
const COMPARADORES: Record<OrdenacaoDaListagem, Comparador> = {
  name: (a, b) => compararNomes(a.jogador.nome, b.jogador.nome),
  value_asc: (a, b) => a.valorDeMercado - b.valorDeMercado,
  value_desc: (a, b) => b.valorDeMercado - a.valorDeMercado,
  age_asc: (a, b) => a.jogador.idade - b.jogador.idade,
  age_desc: (a, b) => b.jogador.idade - a.jogador.idade,
  position: (a, b) => compararPosicoes(a.jogador.posicao, b.jogador.posicao),
};

// RN07.1: o segundo critério desempata o primeiro; depois, sempre o nome e o id crescente
export function criarComparadorDaListagem(ordenacoes: readonly OrdenacaoDaListagem[]): Comparador {
  return (a, b) => {
    for (const ordenacao of ordenacoes) {
      const resultado = COMPARADORES[ordenacao](a, b);
      if (resultado !== 0) {
        return resultado;
      }
    }
    return compararNomes(a.jogador.nome, b.jogador.nome) || a.jogador.id - b.jogador.id;
  };
}