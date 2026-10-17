import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { criarEscalacaoResposta } from '@/modulos/liga/dto/escalacao-resposta.dto';

function criarJogador(id: number): Jogador {
  return Object.assign(new Jogador(), {
    id,
    nome: `Jogador ${id}`,
    posicao: 'ZAG',
    agilidade: 80,
    idade: 25,
    condicao: 'APTO',
    valorBase: 4000,
    clubeId: 1,
    velocidade: 70,
    finalizacao: 60,
    passe: 65,
    drible: 66,
    defesa: 84,
    fisico: 75,
    potencial: 80,
  });
}

const aguias = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', formacao: '2-1-1' });

describe('criarEscalacaoResposta', () => {
  it('com os 5 titulares: complete true e cada jogador com os campos de GET /players/{id}', () => {
    const resposta = criarEscalacaoResposta({ clube: aguias, titulares: [30, 32, 31, 33, 34].map(criarJogador) });
    expect(resposta).toMatchObject({ club_id: 1, formation: '2-1-1', complete: true });
    expect(resposta.players.map((jogador) => jogador.id)).toEqual([30, 32, 31, 33, 34]);
    expect(resposta.players[0]).toMatchObject({ name: 'Jogador 30', position: 'ZAG', defending: 84, base_value: 40, club_id: 1 });
  });

  it('titular vendido: mesma formação, 4 titulares e complete false (RN19.5)', () => {
    expect(criarEscalacaoResposta({ clube: aguias, titulares: [30, 32, 31, 33].map(criarJogador) })).toMatchObject({ formation: '2-1-1', complete: false });
  });

  it('nunca escalou: formation null, players vazio e complete false', () => {
    const novo = Object.assign(new Clube(), { id: 2, nome: 'Delta FC', formacao: null });
    expect(criarEscalacaoResposta({ clube: novo, titulares: [] })).toEqual({ club_id: 2, formation: null, complete: false, players: [] });
  });
});
