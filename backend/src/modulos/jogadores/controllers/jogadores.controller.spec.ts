import type { Response } from 'express';
import { JogadoresController } from '@/modulos/jogadores/controllers/jogadores.controller';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { EditarJogadorDto } from '@/modulos/jogadores/dto/editar-jogador.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { JogadoresService } from '@/modulos/jogadores/services/jogadores.service';

const jogador = Object.assign(new Jogador(), {
  id: 2,
  nome: 'Meia Lua',
  posicao: 'MEI',
  agilidade: 85,
  idade: 25,
  valorBase: 4000,
  condicao: 'APTO',
  clubeId: null,
  velocidade: 70,
  finalizacao: 68,
  passe: 82,
  drible: 79,
  defesa: 55,
  fisico: 64,
  potencial: 86,
});

function criarController() {
  const servico = {
    cadastrar: vi.fn().mockResolvedValue(jogador),
    consultar: vi.fn().mockResolvedValue(jogador),
    editar: vi.fn().mockResolvedValue(jogador),
    listar: vi.fn().mockResolvedValue({ itens: [jogador], pagina: 1, limite: 10, totalDeItens: 1, totalDePaginas: 1 }),
  };
  return { servico, controller: new JogadoresController(servico as unknown as JogadoresService) };
}

describe('JogadoresController', () => {
  it('cadastra e aponta o Location para o jogador criado', async () => {
    const { controller } = criarController();
    const resposta = { location: vi.fn() };
    const corpo = await controller.cadastrar({} as CriarJogadorDto, resposta as unknown as Response);
    expect(resposta.location).toHaveBeenCalledWith('/api/v1/players/2');
    expect(corpo).toMatchObject({ id: 2, base_value: 40, market_value: 40, overall: 75, club_id: null });
  });

  it('consulta pelo id e responde no formato da API', async () => {
    const { controller, servico } = criarController();
    await expect(controller.consultar(2)).resolves.toMatchObject({ id: 2, name: 'Meia Lua', condition: 'APTO' });
    expect(servico.consultar).toHaveBeenCalledWith(2);
  });

  it('lista com os filtros recebidos e responde com data e meta', async () => {
    const { controller, servico } = criarController();
    const resposta = await controller.listar({ position: 'MEI' });
    expect(servico.listar).toHaveBeenCalledWith({ position: 'MEI' });
    expect(resposta.meta).toEqual({ page: 1, limit: 10, total_items: 1, total_pages: 1 });
    expect(resposta.data[0]).toMatchObject({ id: 2, name: 'Meia Lua' });
  });

  it('edita pelo id com o corpo recebido e responde no formato da API', async () => {
    const { controller, servico } = criarController();
    const dados = { name: 'Meia Lua', position: 'MEI', agility: 85, age: 25 } satisfies EditarJogadorDto;
    await expect(controller.editar(2, dados)).resolves.toMatchObject({ id: 2, name: 'Meia Lua', overall: 75, base_value: 40 });
    expect(servico.editar).toHaveBeenCalledWith(2, dados);
  });
});
