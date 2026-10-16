import { criarComparadorDeClubes } from '@/modulos/clubes/helpers/ordenacao-de-clubes';
import type { ClubeDaListagem, OrdenacaoDeClubes } from '@/modulos/clubes/helpers/ordenacao-de-clubes';

function clube(id: number, nome: string, patrimonio: number): ClubeDaListagem {
  return { clube: { id, nome }, patrimonio };
}

// Cada ordenação dá uma ordem diferente; há empate de patrimônio (Bravos e o Leões 4) e de nome (os dois Leões)
const clubes = [clube(1, 'Leões FC', 30000), clube(2, 'Bravos FC', 29815), clube(3, 'Águias FC', 32000), clube(4, 'Leões FC', 29815)];

function ordenar(ordenacao: OrdenacaoDeClubes): number[] {
  return [...clubes].sort(criarComparadorDeClubes(ordenacao)).map((item) => item.clube.id);
}

describe('criarComparadorDeClubes', () => {
  it('name: ordem alfabética sem acento, desempate pelo id', () => {
    expect(ordenar('name')).toEqual([3, 2, 1, 4]);
  });

  it('net_worth_asc: menor patrimônio primeiro, empate pelo nome', () => {
    expect(ordenar('net_worth_asc')).toEqual([2, 4, 1, 3]);
  });

  it('net_worth_desc: maior patrimônio primeiro, empate pelo nome', () => {
    expect(ordenar('net_worth_desc')).toEqual([3, 1, 2, 4]);
  });
});
