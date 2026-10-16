import { Between, DataSource, IsNull, Not, Repository } from 'typeorm';
import { Relogio } from '@/core/comum/relogio/relogio';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { EditarJogadorDto } from '@/modulos/jogadores/dto/editar-jogador.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import type { CondicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { JogadoresService } from '@/modulos/jogadores/services/jogadores.service';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';

// Repositórios simulados: create devolve a entity, save devolve o que receberia do banco
function criarRepositorios() {
  const jogadores = {
    create: vi.fn((dados: Partial<Jogador>) => Object.assign(new Jogador(), dados)),
    save: vi.fn((jogador: Jogador) => Promise.resolve(Object.assign(jogador, { id: 2, condicao: 'APTO' }))),
    findOneBy: vi.fn(),
    find: vi.fn().mockResolvedValue([]),
  };
  const clubes = { existsBy: vi.fn().mockResolvedValue(true) };
  // A transação simulada só executa o trabalho com o manager; save devolve o jogador recebido
  const manager = { findOne: vi.fn(), save: vi.fn((jogador: Jogador) => Promise.resolve(jogador)), delete: vi.fn() };
  const dataSource = { transaction: vi.fn((trabalho: (gerenciador: typeof manager) => Promise<unknown>) => trabalho(manager)) };
  const relogio = { agora: vi.fn(() => new Date('2026-11-02T13:15:00Z')) };
  return { jogadores, clubes, manager, dataSource, relogio };
}

function criarServico({ jogadores, clubes, dataSource, relogio }: ReturnType<typeof criarRepositorios>): JogadoresService {
  return new JogadoresService(jogadores as unknown as Repository<Jogador>, clubes as unknown as Repository<Clube>, dataSource as unknown as DataSource, relogio as Relogio);
}

// Jogador APTO de 25 anos: o valor de mercado é igual ao valor base
function criarJogador(id: number, nome: string, valorBase: number, campos: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), { id, nome, valorBase, posicao: 'MEI', condicao: 'APTO', agilidade: 50, idade: 25, clubeId: null, ...campos });
}

const dados = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
} satisfies CriarJogadorDto;

describe('JogadoresService.cadastrar', () => {
  it('grava o jogador livre, com o valor base da RN06 em centavos', async () => {
    const repositorios = criarRepositorios();
    const jogador = await criarServico(repositorios).cadastrar(dados);
    expect(repositorios.jogadores.create).toHaveBeenCalledWith({
      nome: 'Meia Lua',
      posicao: 'MEI',
      agilidade: 85,
      idade: 25,
      velocidade: 70,
      finalizacao: 68,
      passe: 82,
      drible: 79,
      defesa: 55,
      fisico: 64,
      potencial: 86,
      valorBase: 4000,
      clubeId: null,
      excluidoEm: null,
    });
    expect(jogador).toMatchObject({ id: 2, valorBase: 4000, clubeId: null });
  });

  it('usa a idade do cadastro na jovem promessa (overall 45, potencial 90, 18 anos → 3,63)', async () => {
    const repositorios = criarRepositorios();
    // ZAG com os atributos abaixo dá overall 45
    await criarServico(repositorios).cadastrar({ ...dados, position: 'ZAG', age: 18, pace: 45, shooting: 45, passing: 45, dribbling: 45, defending: 45, physical: 45, potential: 90 });
    expect(repositorios.jogadores.create).toHaveBeenCalledWith(expect.objectContaining({ valorBase: 363 }));
  });
});

describe('JogadoresService.consultar', () => {
  it('busca só entre os jogadores não excluídos (RN09)', async () => {
    const repositorios = criarRepositorios();
    const jogador = Object.assign(new Jogador(), { id: 7 });
    repositorios.jogadores.findOneBy.mockResolvedValue(jogador);
    await expect(criarServico(repositorios).consultar(7)).resolves.toBe(jogador);
    expect(repositorios.jogadores.findOneBy).toHaveBeenCalledWith({ id: 7, excluidoEm: IsNull() });
  });

  it('responde 404 JOGADOR_NAO_ENCONTRADO para inexistente ou excluído', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.findOneBy.mockResolvedValue(null);
    await expect(criarServico(repositorios).consultar(7)).rejects.toThrow(RegraNegocioException);
    await expect(criarServico(repositorios).consultar(7)).rejects.toMatchObject({ codigo: 'JOGADOR_NAO_ENCONTRADO', status: 404, message: 'Jogador não encontrado.' });
  });
});

describe('JogadoresService.listar', () => {
  it('manda ao banco só os filtros de coluna, sempre sem os excluídos (DEC-038)', async () => {
    const repositorios = criarRepositorios();
    await criarServico(repositorios).listar({ position: 'ZAG', condition: 'DOENTE', club_id: 3, free: false, min_age: 20 });
    expect(repositorios.jogadores.find).toHaveBeenCalledWith({ where: { excluidoEm: IsNull(), posicao: 'ZAG', condicao: 'DOENTE', clubeId: 3, idade: Between(20, 45) } });
  });

  it.each([
    [true, IsNull()],
    [false, Not(IsNull())],
  ])('free=%s filtra pelo clube no banco', async (livre, clubeId) => {
    const repositorios = criarRepositorios();
    await criarServico(repositorios).listar({ free: livre, max_age: 30 });
    expect(repositorios.jogadores.find).toHaveBeenCalledWith({ where: { excluidoEm: IsNull(), clubeId, idade: Between(16, 30) } });
  });

  it('responde 404 CLUBE_NAO_ENCONTRADO para club_id de clube inexistente, sem consultar os jogadores', async () => {
    const repositorios = criarRepositorios();
    repositorios.clubes.existsBy.mockResolvedValue(false);
    await expect(criarServico(repositorios).listar({ club_id: 99 })).rejects.toMatchObject({ codigo: 'CLUBE_NAO_ENCONTRADO', status: 404 });
    expect(repositorios.clubes.existsBy).toHaveBeenCalledWith({ id: 99 });
    expect(repositorios.jogadores.find).not.toHaveBeenCalled();
  });

  it('busca no nome sem acento e filtra pela faixa de valor de mercado, inclusiva (RN07)', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.find.mockResolvedValue([
      criarJogador(1, 'João Lua', 1500),
      criarJogador(2, 'Joana Lua', 2000),
      criarJogador(3, 'Joel Lua', 3000),
      criarJogador(4, 'Pedro Sol', 2000),
      // Valor base 2000, dentro da faixa, mas DOENTE: valor de mercado 1400, fora dela
      criarJogador(5, 'Jonas Lua', 2000, { condicao: 'DOENTE' }),
    ]);
    const pagina = await criarServico(repositorios).listar({ search: 'JO', min_value: 1500, max_value: 2000 });
    expect(pagina.itens.map((jogador) => jogador.id)).toEqual([2, 1]);
    expect(pagina).toMatchObject({ pagina: 1, limite: 10, totalDeItens: 2, totalDePaginas: 1 });
  });

  it('ordena por nome por padrão e pagina depois de ordenar', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.find.mockResolvedValue([criarJogador(1, 'Carlos Lima', 1000), criarJogador(2, 'Ana Lima', 1000), criarJogador(3, 'Bia Lima', 1000)]);
    const pagina = await criarServico(repositorios).listar({ page: 2, limit: 2 });
    expect(pagina.itens.map((jogador) => jogador.id)).toEqual([1]);
    expect(pagina).toMatchObject({ pagina: 2, limite: 2, totalDeItens: 3, totalDePaginas: 2 });
  });

  it('ordena pelo valor de mercado, e não pelo valor base (RN07.1)', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.find.mockResolvedValue([criarJogador(1, 'Base Alta', 5000, { condicao: 'DOENTE' }), criarJogador(2, 'Base Baixa', 4000)]);
    const pagina = await criarServico(repositorios).listar({ sort: ['value_desc'] });
    expect(pagina.itens.map((jogador) => jogador.id)).toEqual([2, 1]);
  });
});

describe('JogadoresService.editar', () => {
  const edicao = { name: 'Davi Melo', position: 'ZAG', agility: 70, age: 26 } satisfies EditarJogadorDto;

  it('trava o jogador ativo e grava só os quatro campos editáveis (RN08)', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000, { potencial: 86, velocidade: 70 }));
    const jogador = await criarServico(repositorios).editar(7, edicao);
    expect(repositorios.manager.findOne).toHaveBeenCalledWith(Jogador, { where: { id: 7, excluidoEm: IsNull() }, lock: { mode: 'pessimistic_write' } });
    expect(repositorios.manager.save).toHaveBeenCalledWith(jogador);
    expect(jogador).toMatchObject({ id: 7, nome: 'Davi Melo', posicao: 'ZAG', agilidade: 70, idade: 26, valorBase: 4000, potencial: 86, velocidade: 70 });
  });

  it('responde 404 JOGADOR_NAO_ENCONTRADO para inexistente ou excluído, sem gravar', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(null);
    await expect(criarServico(repositorios).editar(7, edicao)).rejects.toMatchObject({ codigo: 'JOGADOR_NAO_ENCONTRADO', status: 404 });
    expect(repositorios.manager.save).not.toHaveBeenCalled();
  });

  it('aceita a mesma posição em jogador com clube (PR-003)', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000, { posicao: 'ZAG', clubeId: 3 }));
    await expect(criarServico(repositorios).editar(7, edicao)).resolves.toMatchObject({ posicao: 'ZAG', clubeId: 3 });
  });

  it('recusa posição diferente em jogador com clube, com 409 POSICAO_BLOQUEADA_COM_CLUBE e nada gravado', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000, { clubeId: 3 }));
    await expect(criarServico(repositorios).editar(7, edicao)).rejects.toMatchObject({ codigo: 'POSICAO_BLOQUEADA_COM_CLUBE', status: 409 });
    expect(repositorios.manager.save).not.toHaveBeenCalled();
  });

  it('aceita idade igual à atual', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000, { idade: 26 }));
    await expect(criarServico(repositorios).editar(7, edicao)).resolves.toMatchObject({ idade: 26 });
  });

  it('recusa idade menor que a atual, com 409 IDADE_NAO_PODE_DIMINUIR e nada gravado', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000, { idade: 27 }));
    await expect(criarServico(repositorios).editar(7, edicao)).rejects.toMatchObject({ codigo: 'IDADE_NAO_PODE_DIMINUIR', status: 409 });
    expect(repositorios.manager.save).not.toHaveBeenCalled();
  });
});

describe('JogadoresService.alterarCondicao', () => {
  it('trava o jogador ativo e grava a nova condição', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000));
    const jogador = await criarServico(repositorios).alterarCondicao(7, { condition: 'MAL_CONDICIONADO' });
    expect(repositorios.manager.findOne).toHaveBeenCalledWith(Jogador, { where: { id: 7, excluidoEm: IsNull() }, lock: { mode: 'pessimistic_write' } });
    expect(repositorios.manager.save).toHaveBeenCalledWith(jogador);
    expect(jogador.condicao).toBe('MAL_CONDICIONADO');
  });

  it('responde 404 JOGADOR_NAO_ENCONTRADO para inexistente ou excluído, sem gravar', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(null);
    await expect(criarServico(repositorios).alterarCondicao(7, { condition: 'DOENTE' })).rejects.toMatchObject({ codigo: 'JOGADOR_NAO_ENCONTRADO', status: 404 });
    expect(repositorios.manager.delete).not.toHaveBeenCalled();
    expect(repositorios.manager.save).not.toHaveBeenCalled();
  });

  // Tabela de transições de regras-negocio/jogadores.md; só DOENTE → APTO é recusada
  it.each<[CondicaoJogador, CondicaoJogador]>([
    ['APTO', 'APTO'],
    ['APTO', 'MAL_CONDICIONADO'],
    ['MAL_CONDICIONADO', 'APTO'],
    ['MAL_CONDICIONADO', 'MAL_CONDICIONADO'],
    ['DOENTE', 'MAL_CONDICIONADO'],
  ])('de %s para %s: aceita, sem mexer na escalação', async (atual, nova) => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000, { condicao: atual }));
    await expect(criarServico(repositorios).alterarCondicao(7, { condition: nova })).resolves.toMatchObject({ condicao: nova });
    expect(repositorios.manager.delete).not.toHaveBeenCalled();
  });

  it.each<CondicaoJogador>(['APTO', 'MAL_CONDICIONADO', 'DOENTE'])('de %s para DOENTE: aceita e tira o jogador da escalação (RN19.5)', async (atual) => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(criarJogador(7, 'Meia Lua', 4000, { condicao: atual, clubeId: 3 }));
    await expect(criarServico(repositorios).alterarCondicao(7, { condition: 'DOENTE' })).resolves.toMatchObject({ condicao: 'DOENTE', clubeId: 3 });
    expect(repositorios.manager.delete).toHaveBeenCalledWith(Escalacao, { jogadorId: 7 });
  });

  it('recusa DOENTE direto para APTO, com 409 DOENTE_NAO_VAI_DIRETO_PARA_APTO e nada gravado', async () => {
    const repositorios = criarRepositorios();
    const jogador = criarJogador(7, 'Meia Lua', 4000, { condicao: 'DOENTE' });
    repositorios.manager.findOne.mockResolvedValue(jogador);
    await expect(criarServico(repositorios).alterarCondicao(7, { condition: 'APTO' })).rejects.toMatchObject({
      codigo: 'DOENTE_NAO_VAI_DIRETO_PARA_APTO',
      status: 409,
      message: 'Jogador doente precisa passar por MAL_CONDICIONADO antes de voltar a APTO.',
    });
    expect(jogador.condicao).toBe('DOENTE');
    expect(repositorios.manager.save).not.toHaveBeenCalled();
  });
});

describe('JogadoresService.excluir', () => {
  it('trava o jogador ativo e grava excluido_em com o agora do relógio (RN09)', async () => {
    const repositorios = criarRepositorios();
    const jogador = criarJogador(7, 'Meia Lua', 4000, { excluidoEm: null });
    repositorios.manager.findOne.mockResolvedValue(jogador);
    await expect(criarServico(repositorios).excluir(7)).resolves.toBeUndefined();
    expect(repositorios.manager.findOne).toHaveBeenCalledWith(Jogador, { where: { id: 7, excluidoEm: IsNull() }, lock: { mode: 'pessimistic_write' } });
    expect(repositorios.manager.save).toHaveBeenCalledWith(jogador);
    expect(jogador.excluidoEm).toEqual(new Date('2026-11-02T13:15:00Z'));
  });

  it('responde 404 JOGADOR_NAO_ENCONTRADO para inexistente ou já excluído, sem gravar', async () => {
    const repositorios = criarRepositorios();
    repositorios.manager.findOne.mockResolvedValue(null);
    await expect(criarServico(repositorios).excluir(7)).rejects.toMatchObject({ codigo: 'JOGADOR_NAO_ENCONTRADO', status: 404 });
    expect(repositorios.manager.save).not.toHaveBeenCalled();
  });

  it('recusa jogador com clube, com 409 JOGADOR_COM_CLUBE_NAO_PODE_SER_EXCLUIDO e excluido_em nulo', async () => {
    const repositorios = criarRepositorios();
    const jogador = criarJogador(7, 'Meia Lua', 4000, { clubeId: 3, excluidoEm: null });
    repositorios.manager.findOne.mockResolvedValue(jogador);
    await expect(criarServico(repositorios).excluir(7)).rejects.toMatchObject({
      codigo: 'JOGADOR_COM_CLUBE_NAO_PODE_SER_EXCLUIDO',
      status: 409,
      message: 'Jogador com clube não pode ser excluído; venda-o antes.',
    });
    expect(jogador.excluidoEm).toBeNull();
    expect(repositorios.manager.save).not.toHaveBeenCalled();
  });
});
