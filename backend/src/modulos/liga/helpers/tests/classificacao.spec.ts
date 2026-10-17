import { calcularClassificacao } from '@/modulos/liga/helpers/classificacao';
import type { ClubeDaClassificacao, PartidaDaClassificacao } from '@/modulos/liga/helpers/classificacao';

function partida(mandanteId: number, golsMandante: number, golsVisitante: number, visitanteId: number): PartidaDaClassificacao {
  return { mandanteId, golsMandante, golsVisitante, visitanteId };
}

function resumir(clubes: ClubeDaClassificacao[], partidas: PartidaDaClassificacao[]) {
  return calcularClassificacao(clubes, partidas).map((linha) => [linha.posicao, linha.nomeClube, linha.pontos, linha.saldo, linha.golsPro]);
}

describe('calcularClassificacao', () => {
  // Exemplo da RN21: 6 clubes e 4 partidas
  const clubes: ClubeDaClassificacao[] = [
    { id: 1, nome: 'Águias FC' },
    { id: 2, nome: 'Delta FC' },
    { id: 3, nome: 'Gama SC' },
    { id: 4, nome: 'Épsilon EC' },
    { id: 5, nome: 'Tubarões EC' },
    { id: 6, nome: 'Mangue FC' },
  ];
  const partidas = [partida(1, 1, 2, 2), partida(3, 2, 1, 4), partida(4, 3, 2, 1), partida(2, 0, 1, 3)];

  it('reproduz o exemplo de 6 clubes da RN21', () => {
    expect(resumir(clubes, partidas)).toEqual([
      [1, 'Gama SC', 6, 2, 3],
      [2, 'Épsilon EC', 3, 0, 4],
      [3, 'Delta FC', 3, 0, 2],
      [4, 'Mangue FC', 0, 0, 0],
      [5, 'Tubarões EC', 0, 0, 0],
      [6, 'Águias FC', 0, -2, 3],
    ]);
  });

  it('conta jogos, vitórias, empates, derrotas e gols de cada clube', () => {
    const [gama, epsilon] = calcularClassificacao(clubes, partidas);
    expect(gama).toEqual({ posicao: 1, clubeId: 3, nomeClube: 'Gama SC', jogos: 2, vitorias: 2, empates: 0, derrotas: 0, golsPro: 3, golsContra: 1, saldo: 2, pontos: 6 });
    expect(epsilon).toEqual({ posicao: 2, clubeId: 4, nomeClube: 'Épsilon EC', jogos: 2, vitorias: 1, empates: 0, derrotas: 1, golsPro: 4, golsContra: 4, saldo: 0, pontos: 3 });
  });

  it('reproduz o exemplo de 3 clubes do E 2.4.3', () => {
    const tresClubes = clubes.slice(0, 3);
    expect(calcularClassificacao(tresClubes, [partida(1, 1, 2, 2)]).map((linha) => [linha.posicao, linha.clubeId, linha.jogos, linha.vitorias, linha.derrotas, linha.saldo, linha.pontos])).toEqual([
      [1, 2, 1, 1, 0, 1, 3],
      [2, 3, 0, 0, 0, 0, 0],
      [3, 1, 1, 0, 1, -1, 0],
    ]);
  });

  it('empate vale 1 ponto para cada lado', () => {
    const [primeiro, segundo] = calcularClassificacao(clubes.slice(0, 2), [partida(1, 2, 2, 2)]);
    expect([primeiro, segundo].map((linha) => [linha.nomeClube, linha.empates, linha.pontos, linha.vitorias, linha.derrotas])).toEqual([
      ['Águias FC', 1, 1, 0, 0],
      ['Delta FC', 1, 1, 0, 0],
    ]);
  });

  it('mais pontos vence saldo maior', () => {
    // Delta: 2 vitórias por 1 × 0 (6 pontos, saldo 2); Gama: 1 vitória por 5 × 0 e 1 derrota (3 pontos, saldo 4)
    const lista = [partida(2, 1, 0, 1), partida(2, 1, 0, 3), partida(3, 5, 0, 1)];
    expect(resumir(clubes.slice(0, 3), lista).slice(0, 2)).toEqual([
      [1, 'Delta FC', 6, 2, 2],
      [2, 'Gama SC', 3, 4, 5],
    ]);
  });

  it('nome igual (não acontece, o nome é único) desempata pelo id', () => {
    const iguais: ClubeDaClassificacao[] = [
      { id: 9, nome: 'Mesmo FC' },
      { id: 7, nome: 'Mesmo FC' },
    ];
    expect(calcularClassificacao(iguais, []).map((linha) => linha.clubeId)).toEqual([7, 9]);
  });

  it('sem clubes → lista vazia', () => {
    expect(calcularClassificacao([], [])).toEqual([]);
  });

  it('partida com clube fora da lista é erro interno', () => {
    expect(() => calcularClassificacao(clubes.slice(0, 1), [partida(1, 1, 0, 2)])).toThrow('Partida com clube fora da lista: 2');
  });
});
