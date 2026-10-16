import type { Response } from 'express';
import { ClubesController } from '@/modulos/clubes/controllers/clubes.controller';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { ClubesService } from '@/modulos/clubes/services/clubes.service';

describe('ClubesController', () => {
  it('cria, aponta o Location e responde com elenco vazio', async () => {
    const clube = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', sigla: 'AGU', caixa: 30000 });
    const servico = { criar: vi.fn().mockResolvedValue(clube) };
    const resposta = { location: vi.fn() };
    const dados = { name: 'Águias FC', acronym: 'AGU' };
    const corpo = await new ClubesController(servico as unknown as ClubesService).criar(dados, resposta as unknown as Response);
    expect(servico.criar).toHaveBeenCalledWith(dados);
    expect(resposta.location).toHaveBeenCalledWith('/api/v1/clubs/1');
    expect(corpo).toEqual({ id: 1, name: 'Águias FC', acronym: 'AGU', cash: 300, squad_value: 0, net_worth: 300 });
  });
});
