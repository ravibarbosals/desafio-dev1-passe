import type { Response } from 'express';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { LigaController } from '@/modulos/liga/controllers/liga.controller';
import { Partida } from '@/modulos/liga/entities/partida.entity';
import { LigaService } from '@/modulos/liga/services/liga.service';

const clube = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', formacao: '2-1-1' });
const delta = Object.assign(new Clube(), { id: 2, nome: 'Delta FC' });

function criarPartida(id: number): Partida {
  return Object.assign(new Partida(), {
    id,
    mandante: clube,
    visitante: delta,
    golsMandante: 1,
    golsVisitante: 2,
    formacaoMandante: '2-1-1',
    formacaoVisitante: '2-2',
    jogadaEm: new Date('2026-11-12T18:00:00Z'),
    duelos: [],
  });
}

describe('LigaController', () => {
  it('escala pelo id da URL, com o corpo recebido', async () => {
    const servico = { escalar: vi.fn().mockResolvedValue({ clube, titulares: [] }) };
    const dados = { formation: '2-1-1' as const, player_ids: [34, 31, 30, 33, 32] };
    const corpo = await new LigaController(servico as unknown as LigaService).escalar(1, dados);
    expect(servico.escalar).toHaveBeenCalledWith(1, dados);
    expect(corpo).toEqual({ club_id: 1, formation: '2-1-1', complete: false, players: [] });
  });

  it('consulta a escalação pelo id da URL', async () => {
    const servico = { consultarEscalacao: vi.fn().mockResolvedValue({ clube, titulares: [] }) };
    const corpo = await new LigaController(servico as unknown as LigaService).consultarEscalacao(1);
    expect(servico.consultarEscalacao).toHaveBeenCalledWith(1);
    expect(corpo).toMatchObject({ club_id: 1, formation: '2-1-1' });
  });

  it('joga a partida, aponta o Location para ela e responde com os duelos', async () => {
    const servico = { jogar: vi.fn().mockResolvedValue(criarPartida(7)) };
    const resposta = { location: vi.fn() };
    const dados = { home_club_id: 1, away_club_id: 2 };
    const corpo = await new LigaController(servico as unknown as LigaService).jogar(dados, resposta as unknown as Response);
    expect(servico.jogar).toHaveBeenCalledWith(dados);
    expect(resposta.location).toHaveBeenCalledWith('/api/v1/matches/7');
    expect(corpo).toMatchObject({ id: 7, result: 'VISITANTE', home: { club_id: 1, goals: 1 }, away: { club_id: 2, formation: '2-2' }, duels: [] });
  });

  it('lista as partidas com o filtro recebido, sem os duelos', async () => {
    const servico = { listarPartidas: vi.fn().mockResolvedValue([criarPartida(8), criarPartida(7)]) };
    const corpo = await new LigaController(servico as unknown as LigaService).listarPartidas({ club_id: 2 });
    expect(servico.listarPartidas).toHaveBeenCalledWith({ club_id: 2 });
    expect(corpo.map((partida) => partida.id)).toEqual([8, 7]);
    expect(corpo[0]).not.toHaveProperty('duels');
  });

  it('consulta a partida pelo id da URL, com os duelos', async () => {
    const servico = { consultarPartida: vi.fn().mockResolvedValue(criarPartida(7)) };
    const corpo = await new LigaController(servico as unknown as LigaService).consultarPartida(7);
    expect(servico.consultarPartida).toHaveBeenCalledWith(7);
    expect(corpo).toMatchObject({ id: 7, result: 'VISITANTE', duels: [] });
  });

  it('responde a classificação na ordem calculada', async () => {
    const linha = { posicao: 1, clubeId: 2, nomeClube: 'Delta FC', jogos: 1, vitorias: 1, empates: 0, derrotas: 0, golsPro: 2, golsContra: 1, saldo: 1, pontos: 3 };
    const servico = { consultarClassificacao: vi.fn().mockResolvedValue([linha, { ...linha, posicao: 2, clubeId: 3, nomeClube: 'Gama SC' }]) };
    const corpo = await new LigaController(servico as unknown as LigaService).consultarClassificacao();
    expect(corpo.map((linhaDaResposta) => [linhaDaResposta.position, linhaDaResposta.club_id])).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });
});
