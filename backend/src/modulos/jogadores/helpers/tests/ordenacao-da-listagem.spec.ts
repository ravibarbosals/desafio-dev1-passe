import type { PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { criarComparadorDaListagem, JogadorDaListagem, OrdenacaoDaListagem } from '@/modulos/jogadores/helpers/ordenacao-da-listagem';

function item(id: number, nome: string, idade: number, posicao: PosicaoJogador, valorDeMercado: number): JogadorDaListagem {
  return { jogador: { id, nome, idade, posicao }, valorDeMercado };
}

// Cada critério dá uma ordem diferente, para o teste não passar por coincidência
const jogadores = [item(1, 'Carlos Zago', 30, 'ATA', 3000), item(2, 'Ábner Lima', 22, 'MEI', 7000), item(3, 'Bruno Alves', 35, 'GOL', 9000), item(4, 'Davi Rocha', 19, 'ZAG', 5000)];

function ordenar(ordenacoes: OrdenacaoDaListagem[], itens = jogadores): number[] {
  return [...itens].sort(criarComparadorDaListagem(ordenacoes)).map((jogador) => jogador.jogador.id);
}

describe('criarComparadorDaListagem', () => {
  it.each<[OrdenacaoDaListagem, number[]]>([
    ['name', [2, 3, 1, 4]],
    ['value_asc', [1, 4, 2, 3]],
    ['value_desc', [3, 2, 4, 1]],
    ['age_asc', [4, 2, 1, 3]],
    ['age_desc', [3, 1, 2, 4]],
    ['position', [3, 4, 2, 1]],
  ])('sort=%s', (ordenacao, esperado) => {
    expect(ordenar([ordenacao])).toEqual(esperado);
  });

  it('usa o segundo critério para desempatar o primeiro (sort=position,value_desc)', () => {
    const empatados = [item(1, 'Ana Lima', 25, 'MEI', 3000), item(2, 'Bia Lima', 25, 'MEI', 8000), item(3, 'Caio Lima', 25, 'GOL', 1000)];
    expect(ordenar(['position', 'value_desc'], empatados)).toEqual([3, 2, 1]);
  });

  it('desempata pelo nome e depois pelo id, depois dos critérios pedidos', () => {
    const empatados = [item(9, 'Bia Lima', 25, 'MEI', 3000), item(7, 'Ana Lima', 25, 'MEI', 3000), item(5, 'Ána Lima', 25, 'MEI', 3000)];
    expect(ordenar(['value_desc'], empatados)).toEqual([5, 7, 9]);
  });

  it('ordena pelo valor de mercado, e não pelo valor base (RN07.1)', () => {
    // O jogador 1 tem valor base maior, mas está DOENTE: o valor de mercado dele (calculado antes) é menor
    const itens = [item(1, 'Base Alta', 25, 'MEI', 4900), item(2, 'Base Baixa', 25, 'MEI', 5000)];
    expect(ordenar(['value_desc'], itens)).toEqual([2, 1]);
  });
});