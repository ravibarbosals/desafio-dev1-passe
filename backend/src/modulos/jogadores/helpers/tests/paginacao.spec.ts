import { paginar } from '@/modulos/jogadores/helpers/paginacao';

const vinteETres = Array.from({ length: 23 }, (_, indice) => indice + 1);

describe('paginar', () => {
  // Tabela da RN07 do enunciado
  it.each([
    [vinteETres, 10, 1, Array.from({ length: 10 }, (_, indice) => indice + 1), 3],
    [vinteETres, 10, 3, [21, 22, 23], 3],
    [vinteETres, 10, 4, [], 3],
    [vinteETres, 50, 1, vinteETres, 1],
    [[], 10, 1, [], 0],
  ])('%#: limit %d, page %d', (itens, limite, pagina, esperados, totalDePaginas) => {
    expect(paginar(itens, pagina, limite)).toEqual({ itens: esperados, pagina, limite, totalDeItens: itens.length, totalDePaginas });
  });
});