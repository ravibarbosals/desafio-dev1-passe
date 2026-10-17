import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { LigaController } from '@/modulos/liga/controllers/liga.controller';
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
});
