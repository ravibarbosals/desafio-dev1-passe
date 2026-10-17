import type { Response } from 'express';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { LigaController } from '@/modulos/liga/controllers/liga.controller';
import { Partida } from '@/modulos/liga/entities/partida.entity';
import { LigaService } from '@/modulos/liga/services/liga.service';

const clube = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', formacao: '2-1-1' });

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
    const delta = Object.assign(new Clube(), { id: 2, nome: 'Delta FC' });
    const partida = Object.assign(new Partida(), {
      id: 7,
      mandante: clube,
      visitante: delta,
      golsMandante: 1,
      golsVisitante: 2,
      formacaoMandante: '2-1-1',
      formacaoVisitante: '2-2',
      jogadaEm: new Date('2026-11-12T18:00:00Z'),
      duelos: [],
    });
    const servico = { jogar: vi.fn().mockResolvedValue(partida) };
    const resposta = { location: vi.fn() };
    const dados = { home_club_id: 1, away_club_id: 2 };
    const corpo = await new LigaController(servico as unknown as LigaService).jogar(dados, resposta as unknown as Response);
    expect(servico.jogar).toHaveBeenCalledWith(dados);
    expect(resposta.location).toHaveBeenCalledWith('/api/v1/matches/7');
    expect(corpo).toMatchObject({ id: 7, result: 'VISITANTE', home: { club_id: 1, goals: 1 }, away: { club_id: 2, formation: '2-2' }, duels: [] });
  });
});
