import { compararOrdemDoElenco, compararPosicoes } from '@/modulos/jogadores/helpers/ordem-do-elenco';
import type { JogadorDoElenco } from '@/modulos/jogadores/helpers/ordem-do-elenco';

function ordenar(jogadores: JogadorDoElenco[]): number[] {
  return [...jogadores].sort(compararOrdemDoElenco).map((jogador) => jogador.id);
}

describe('compararPosicoes', () => {
  it('ordena GOL, ZAG, LAT, MEI, ATA, e não em ordem alfabética', () => {
    expect((['ATA', 'MEI', 'LAT', 'ZAG', 'GOL'] as const).toSorted(compararPosicoes)).toEqual(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']);
  });
});

describe('compararOrdemDoElenco', () => {
  it('põe o elenco na ordem das posições, fora da ordem de cadastro', () => {
    const elenco: JogadorDoElenco[] = [
      { id: 1, nome: 'Atacante Um', posicao: 'ATA' },
      { id: 2, nome: 'Meia Dois', posicao: 'MEI' },
      { id: 3, nome: 'Goleiro Tres', posicao: 'GOL' },
      { id: 4, nome: 'Lateral Quatro', posicao: 'LAT' },
      { id: 5, nome: 'Zagueiro Cinco', posicao: 'ZAG' },
    ];
    expect(ordenar(elenco)).toEqual([3, 5, 4, 2, 1]);
  });

  it('desempata a mesma posição pelo nome, sem acento', () => {
    const elenco: JogadorDoElenco[] = [
      { id: 1, nome: 'Gama Silva', posicao: 'ZAG' },
      { id: 2, nome: 'Épsilon Souza', posicao: 'ZAG' },
      { id: 3, nome: 'Delta Lima', posicao: 'ZAG' },
    ];
    expect(ordenar(elenco)).toEqual([3, 2, 1]);
  });

  it('desempata o mesmo nome pelo id', () => {
    const elenco: JogadorDoElenco[] = [
      { id: 9, nome: 'Aguias Lima', posicao: 'MEI' },
      { id: 4, nome: 'Águias Lima', posicao: 'MEI' },
    ];
    expect(ordenar(elenco)).toEqual([4, 9]);
  });
});
