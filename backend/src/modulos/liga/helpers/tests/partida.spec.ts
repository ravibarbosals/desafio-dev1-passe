import type { CondicaoJogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { jogarPartida } from '@/modulos/liga/helpers/partida';
import type { TimeDaPartida, TitularDaPartida } from '@/modulos/liga/helpers/partida';

// Atributos fora do exemplo com valores distintos, para um atributo trocado mudar o resultado
function titular(id: number, nome: string, posicao: PosicaoJogador, atributos: Partial<TitularDaPartida> = {}, condicao: CondicaoJogador = 'APTO'): TitularDaPartida {
  return Object.assign({ id, nome, posicao, condicao, finalizacao: 11, passe: 22, drible: 33, defesa: 44 }, atributos);
}

// Exemplo completo da RN20, com os titulares fora da ordem do elenco
const aguias: TimeDaPartida = {
  clubeId: 1,
  titulares: [
    titular(34, 'Otto Rangel', 'ATA', { finalizacao: 75 }),
    titular(31, 'Davi Lins', 'LAT', { drible: 74, defesa: 66 }, 'MAL_CONDICIONADO'),
    titular(33, 'Lauro Neves', 'MEI', { passe: 82 }),
    titular(30, 'Rui Prado', 'GOL', { defesa: 77 }),
    titular(32, 'Téo Brandão', 'ZAG', { defesa: 84 }),
  ],
};
const delta: TimeDaPartida = {
  clubeId: 2,
  titulares: [
    titular(44, 'Ugo Falcão', 'ATA', { finalizacao: 81 }),
    titular(43, 'Nei Soares', 'MEI', { passe: 70 }),
    titular(42, 'Lino Matos', 'LAT', { drible: 79, defesa: 63 }),
    titular(41, 'Hugo Vaz', 'ZAG', { defesa: 84 }),
    titular(40, 'Ivo Teles', 'GOL', { defesa: 72 }),
  ],
};

function resumirDuelos(time1: TimeDaPartida, time2: TimeDaPartida) {
  return jogarPartida(time1, time2).duelos.map((duelo) => [duelo.ordem, duelo.atacanteId, duelo.atributoAtaque, duelo.valorAtaque, duelo.defensorId, duelo.valorDefesa, duelo.gol]);
}

describe('jogarPartida', () => {
  it('reproduz o exemplo da RN20 duelo a duelo: Águias FC 1 × 2 Delta FC', () => {
    expect(resumirDuelos(aguias, delta)).toEqual([
      [1, 34, 'shooting', 75, 40, 72, true],
      [2, 33, 'passing', 82, 41, 84, false],
      [3, 31, 'dribbling', 63, 42, 63, false],
      [4, 44, 'shooting', 81, 30, 77, true],
      [5, 43, 'passing', 70, 32, 84, false],
      [6, 42, 'dribbling', 79, 31, 56, true],
    ]);
    expect(jogarPartida(aguias, delta)).toMatchObject({ golsMandante: 1, golsVisitante: 2, resultado: 'VISITANTE' });
  });

  it('grava a fotografia do duelo: clube atacante, nomes, posições, condições e atributos', () => {
    expect(jogarPartida(aguias, delta).duelos[5]).toEqual({
      ordem: 6,
      clubeAtacanteId: 2,
      atacanteId: 42,
      defensorId: 31,
      nomeAtacante: 'Lino Matos',
      nomeDefensor: 'Davi Lins',
      posicaoAtacante: 'LAT',
      posicaoDefensor: 'LAT',
      condicaoAtacante: 'APTO',
      condicaoDefensor: 'MAL_CONDICIONADO',
      atributoAtaque: 'dribbling',
      atributoDefesa: 'defending',
      valorAtaque: 79,
      valorDefesa: 56,
      gol: true,
    });
  });

  it('trocar o mandante só troca a numeração dos duelos: Delta FC 2 × 1 Águias FC', () => {
    expect(jogarPartida(delta, aguias)).toMatchObject({ golsMandante: 2, golsVisitante: 1, resultado: 'MANDANTE' });
  });

  it('MAL_CONDICIONADO: 50 × 0,85 = 42,5 → 43, no ataque e na defesa', () => {
    const fraco: TimeDaPartida = {
      clubeId: 3,
      titulares: [
        titular(50, 'Goleiro Fraco', 'GOL', { defesa: 50 }, 'MAL_CONDICIONADO'),
        titular(51, 'Zagueiro Um', 'ZAG'),
        titular(52, 'Lateral Dois', 'LAT'),
        titular(53, 'Meia Tres', 'MEI'),
        titular(54, 'Atacante Fraco', 'ATA', { finalizacao: 50 }, 'MAL_CONDICIONADO'),
      ],
    };
    const [primeiro] = jogarPartida(fraco, fraco).duelos;
    expect([primeiro.valorAtaque, primeiro.valorDefesa, primeiro.gol]).toEqual([43, 43, false]);
  });

  it('no 1-2-1, os dois MEI seguem o nome: o primeiro é o 2º jogador de linha (duelo 3), o outro o 3º (duelo 2)', () => {
    const meiaMeia: TimeDaPartida = {
      clubeId: 3,
      titulares: [
        titular(60, 'Goleiro Gama', 'GOL'),
        titular(61, 'Zagueiro Gama', 'ZAG'),
        titular(62, 'Bruno Meia', 'MEI', { passe: 90 }),
        titular(63, 'Álvaro Meia', 'MEI', { passe: 40 }),
        titular(64, 'Atacante Gama', 'ATA'),
      ],
    };
    const [, segundo, terceiro] = resumirDuelos(meiaMeia, delta);
    expect(segundo).toEqual([2, 62, 'passing', 90, 41, 84, true]);
    expect(terceiro).toEqual([3, 63, 'passing', 40, 42, 63, false]);
  });

  it('no 3-1 com 2 ZAG, o 2º jogador de linha é um ZAG e ataca com drible (duelo 3)', () => {
    const tresUm: TimeDaPartida = {
      clubeId: 3,
      titulares: [
        titular(70, 'Goleiro Gama', 'GOL'),
        titular(71, 'Bento Zagueiro', 'ZAG'),
        titular(72, 'Caio Zagueiro', 'ZAG', { drible: 65, passe: 99 }),
        titular(73, 'Lateral Gama', 'LAT'),
        titular(74, 'Atacante Gama', 'ATA'),
      ],
    };
    expect(resumirDuelos(tresUm, delta)[2]).toEqual([3, 72, 'dribbling', 65, 42, 63, true]);
  });

  it('mesmos gols → EMPATE', () => {
    expect(jogarPartida(aguias, aguias)).toMatchObject({ golsMandante: 1, golsVisitante: 1, resultado: 'EMPATE' });
  });

  it('titular DOENTE é erro interno: o service recusa antes (409)', () => {
    const doente: TimeDaPartida = { clubeId: 2, titulares: delta.titulares.map((jogador) => (jogador.id === 40 ? { ...jogador, condicao: 'DOENTE' as const } : jogador)) };
    expect(() => jogarPartida(aguias, doente)).toThrow('Titular DOENTE na partida: jogador 40');
  });

  it('sem 5 titulares com 1 goleiro é erro interno: o service recusa antes (409)', () => {
    expect(() => jogarPartida(aguias, { clubeId: 2, titulares: delta.titulares.filter((jogador) => jogador.id !== 44) })).toThrow('Escalação inválida na partida: clube 2');
    const semGoleiro = delta.titulares.map((jogador) => (jogador.id === 40 ? { ...jogador, posicao: 'ZAG' as const } : jogador));
    expect(() => jogarPartida(aguias, { clubeId: 2, titulares: semGoleiro })).toThrow('Escalação inválida na partida: clube 2');
    const doisGoleiros = delta.titulares.map((jogador) => (jogador.id === 41 ? { ...jogador, posicao: 'GOL' as const } : jogador));
    expect(() => jogarPartida(aguias, { clubeId: 2, titulares: doisGoleiros })).toThrow('Escalação inválida na partida: clube 2');
  });
});
