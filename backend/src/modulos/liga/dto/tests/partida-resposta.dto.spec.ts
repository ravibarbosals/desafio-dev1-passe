import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { criarPartidaResposta, criarPartidaResumoResposta } from '@/modulos/liga/dto/partida-resposta.dto';
import { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';
import { Partida } from '@/modulos/liga/entities/partida.entity';

function criarDuelo(ordem: number, campos: Partial<DueloPartida> = {}): DueloPartida {
  return Object.assign(
    new DueloPartida(),
    {
      ordem,
      clubeAtacanteId: ordem <= 3 ? 1 : 2,
      atacanteId: 34,
      defensorId: 40,
      nomeAtacante: 'Otto Rangel',
      nomeDefensor: 'Ivo Teles',
      posicaoAtacante: 'ATA',
      posicaoDefensor: 'GOL',
      condicaoAtacante: 'APTO',
      condicaoDefensor: 'APTO',
      atributoAtaque: 'shooting',
      atributoDefesa: 'defending',
      valorAtaque: 75,
      valorDefesa: 72,
      gol: true,
    },
    campos,
  );
}

// Exemplo 2.4.2: Águias FC 1 × 2 Delta FC, jogada às 15h de Brasília
function criarPartida(campos: Partial<Partida> = {}): Partida {
  return Object.assign(
    new Partida(),
    {
      id: 1,
      mandante: Object.assign(new Clube(), { id: 1, nome: 'Águias FC' }),
      visitante: Object.assign(new Clube(), { id: 2, nome: 'Delta FC' }),
      golsMandante: 1,
      golsVisitante: 2,
      formacaoMandante: '2-1-1',
      formacaoVisitante: '2-2',
      jogadaEm: new Date('2026-11-12T18:00:00Z'),
      duelos: [6, 1, 4, 2, 5, 3].map((ordem) => criarDuelo(ordem)),
    },
    campos,
  );
}

describe('criarPartidaResumoResposta', () => {
  it('monta o cabeçalho do exemplo 2.4.2, com o result calculado do placar', () => {
    expect(criarPartidaResumoResposta(criarPartida())).toEqual({
      id: 1,
      played_at: '2026-11-12T15:00:00-03:00',
      home: { club_id: 1, club_name: 'Águias FC', formation: '2-1-1', goals: 1 },
      away: { club_id: 2, club_name: 'Delta FC', formation: '2-2', goals: 2 },
      result: 'VISITANTE',
    });
  });

  it('sem duels', () => {
    expect(criarPartidaResumoResposta(criarPartida())).not.toHaveProperty('duels');
  });

  it('clube não carregado é erro interno', () => {
    expect(() => criarPartidaResumoResposta(criarPartida({ visitante: undefined }))).toThrow('Partida sem o clube carregado');
  });
});

describe('criarPartidaResposta', () => {
  it('traz os 6 duelos na ordem 1 a 6 (RN21.2)', () => {
    expect(criarPartidaResposta(criarPartida()).duels.map((duelo) => [duelo.order, duelo.attacking_club_id])).toEqual([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 2],
      [5, 2],
      [6, 2],
    ]);
  });

  it('monta atacante e defensor como no exemplo 2.4.2', () => {
    const duelo = criarDuelo(3, {
      atacanteId: 31,
      nomeAtacante: 'Davi Lins',
      posicaoAtacante: 'LAT',
      condicaoAtacante: 'MAL_CONDICIONADO',
      atributoAtaque: 'dribbling',
      valorAtaque: 63,
      defensorId: 42,
      nomeDefensor: 'Lino Matos',
      posicaoDefensor: 'LAT',
      valorDefesa: 63,
      gol: false,
    });
    expect(criarPartidaResposta(criarPartida({ duelos: [duelo] })).duels).toEqual([
      {
        order: 3,
        attacking_club_id: 1,
        attacker: { player_id: 31, player_name: 'Davi Lins', position: 'LAT', condition: 'MAL_CONDICIONADO', attribute: 'dribbling', value: 63 },
        defender: { player_id: 42, player_name: 'Lino Matos', position: 'LAT', condition: 'APTO', attribute: 'defending', value: 63 },
        goal: false,
      },
    ]);
  });

  it('empate no placar → EMPATE', () => {
    expect(criarPartidaResposta(criarPartida({ golsMandante: 2, golsVisitante: 2 })).result).toBe('EMPATE');
  });

  it('duelos não carregados é erro interno', () => {
    expect(() => criarPartidaResposta(criarPartida({ duelos: undefined }))).toThrow('Partida sem os duelos carregados');
  });
});
