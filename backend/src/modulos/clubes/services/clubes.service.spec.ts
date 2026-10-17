import { DataSource, IsNull, Not, QueryFailedError, Repository } from 'typeorm';
import { Relogio } from '@/core/comum/relogio/relogio';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { ClubesService } from '@/modulos/clubes/services/clubes.service';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';

// A transação simulada só executa o trabalho com o manager
function criarManager() {
  return {
    query: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    existsBy: vi.fn().mockResolvedValue(false),
    create: vi.fn((_entidade: unknown, dados: Partial<Clube>) => Object.assign(new Clube(), dados)),
    save: vi.fn((clube: Clube) => Promise.resolve(Object.assign(clube, { id: 1, caixa: 30000 }))),
  };
}

function criarRepositorios() {
  return {
    clubes: { find: vi.fn().mockResolvedValue([]), findOneBy: vi.fn() },
    jogadores: { find: vi.fn().mockResolvedValue([]) },
    contratos: { find: vi.fn().mockResolvedValue([]) },
  };
}

// Momento do exemplo 2.2.2 do enunciado: 02/11/2026, 10h15 em Brasília
const agora = new Date('2026-11-02T13:15:00Z');
const umDia = 24 * 60 * 60 * 1000;

function criarServico(manager = criarManager(), repositorios = criarRepositorios()): ClubesService {
  const dataSource = { transaction: vi.fn((trabalho: (gerenciador: typeof manager) => Promise<unknown>) => trabalho(manager)) };
  const relogio = { agora: () => agora };
  return new ClubesService(
    repositorios.clubes as unknown as Repository<Clube>,
    repositorios.jogadores as unknown as Repository<Jogador>,
    repositorios.contratos as unknown as Repository<Contrato>,
    dataSource as unknown as DataSource,
    relogio as Relogio,
  );
}

function criarClube(id: number, nome: string, caixa: number): Clube {
  return Object.assign(new Clube(), { id, nome, sigla: nome.slice(0, 3).toUpperCase(), caixa });
}

// Valor base 40,00, MAL_CONDICIONADO, agilidade 85, 25 anos: valor de mercado 37,00 (exemplo 2.1.4)
function criarJogador(id: number, nome: string, campos: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), { id, nome, posicao: 'MEI', valorBase: 4000, condicao: 'MAL_CONDICIONADO', agilidade: 85, idade: 25, clubeId: 1, ...campos });
}

function criarContrato(jogadorId: number, fidelidadeAte: Date): Contrato {
  return Object.assign(new Contrato(), { jogadorId, clubeId: 1, valorCompra: 3700, fidelidadeAte, situacao: 'ATIVO' });
}

function violacaoDoIndice(constraint: string): QueryFailedError {
  return new QueryFailedError('INSERT INTO clubes ...', [], Object.assign(new Error('duplicate key'), { code: '23505', constraint }));
}

const dados = { name: 'Águias FC', acronym: 'AGU' };

describe('ClubesService.criar', () => {
  it('trava a criação, confere limite, nome e sigla e grava com o nome normalizado (RN10)', async () => {
    const manager = criarManager();
    await expect(criarServico(manager).criar(dados)).resolves.toMatchObject({ id: 1, nome: 'Águias FC', sigla: 'AGU', caixa: 30000 });
    expect(manager.query).toHaveBeenCalledWith('SELECT pg_advisory_xact_lock($1)', [expect.any(Number)]);
    expect(manager.existsBy).toHaveBeenCalledWith(Clube, { nomeNormalizado: 'águias fc' });
    expect(manager.existsBy).toHaveBeenCalledWith(Clube, { sigla: 'AGU' });
    expect(manager.create).toHaveBeenCalledWith(Clube, { nome: 'Águias FC', nomeNormalizado: 'águias fc', sigla: 'AGU', formacao: null });
  });

  it('trava antes de contar os clubes (DEC-039)', async () => {
    const manager = criarManager();
    await criarServico(manager).criar(dados);
    expect(manager.query.mock.invocationCallOrder[0]).toBeLessThan(manager.count.mock.invocationCallOrder[0]);
  });

  it('aceita o 20º clube', async () => {
    const manager = criarManager();
    manager.count.mockResolvedValue(19);
    await expect(criarServico(manager).criar(dados)).resolves.toBeInstanceOf(Clube);
  });

  it('recusa o 21º clube com 409 LIMITE_DE_CLUBES_ATINGIDO, sem gravar', async () => {
    const manager = criarManager();
    manager.count.mockResolvedValue(20);
    await expect(criarServico(manager).criar(dados)).rejects.toMatchObject({ codigo: 'LIMITE_DE_CLUBES_ATINGIDO', status: 409, message: 'A liga já tem o máximo de 20 clubes.' });
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('recusa nome repetido com 409 NOME_DE_CLUBE_JA_CADASTRADO, sem gravar', async () => {
    const manager = criarManager();
    manager.existsBy.mockImplementation((_entidade: unknown, filtro: object) => Promise.resolve('nomeNormalizado' in filtro));
    await expect(criarServico(manager).criar(dados)).rejects.toMatchObject({ codigo: 'NOME_DE_CLUBE_JA_CADASTRADO', status: 409, message: 'Já existe um clube com este nome.' });
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('recusa sigla repetida com 409 SIGLA_JA_CADASTRADA, sem gravar', async () => {
    const manager = criarManager();
    manager.existsBy.mockImplementation((_entidade: unknown, filtro: object) => Promise.resolve('sigla' in filtro));
    await expect(criarServico(manager).criar(dados)).rejects.toMatchObject({ codigo: 'SIGLA_JA_CADASTRADA', status: 409, message: 'Já existe um clube com esta sigla.' });
    expect(manager.save).not.toHaveBeenCalled();
  });

  it.each([
    ['uq_clubes_nome_normalizado', 'NOME_DE_CLUBE_JA_CADASTRADO'],
    ['uq_clubes_sigla', 'SIGLA_JA_CADASTRADA'],
  ])('traduz a violação do índice %s (23505) para 409 %s', async (indice, codigo) => {
    const manager = criarManager();
    manager.save.mockRejectedValue(violacaoDoIndice(indice));
    await expect(criarServico(manager).criar(dados)).rejects.toMatchObject({ codigo, status: 409 });
  });

  it('deixa passar outro erro do banco', async () => {
    const manager = criarManager();
    const erro = violacaoDoIndice('pk_clubes');
    manager.save.mockRejectedValue(erro);
    await expect(criarServico(manager).criar(dados)).rejects.toBe(erro);
  });
});

describe('ClubesService.listar', () => {
  it('soma o valor de mercado do elenco ativo de cada clube (RN11)', async () => {
    const repositorios = criarRepositorios();
    repositorios.clubes.find.mockResolvedValue([criarClube(1, 'Águias FC', 26115), criarClube(2, 'Bravos FC', 30000)]);
    repositorios.jogadores.find.mockResolvedValue([criarJogador(2, 'Meia Lua'), criarJogador(3, 'Outro Nome', { condicao: 'APTO' })]);
    const clubes = await criarServico(undefined, repositorios).listar({});
    expect(repositorios.jogadores.find).toHaveBeenCalledWith({ where: { clubeId: Not(IsNull()), excluidoEm: IsNull() } });
    expect(clubes.map(({ clube, valorDoElenco }) => [clube.id, valorDoElenco])).toEqual([
      [1, 7700],
      [2, 0],
    ]);
  });

  it('ordena pelo patrimônio quando pedido, com o valor do elenco somado ao caixa', async () => {
    const repositorios = criarRepositorios();
    // Águias: 261,15 + 37,00 = 298,15; Bravos: 300,00 sem elenco
    repositorios.clubes.find.mockResolvedValue([criarClube(1, 'Águias FC', 26115), criarClube(2, 'Bravos FC', 30000)]);
    repositorios.jogadores.find.mockResolvedValue([criarJogador(2, 'Meia Lua')]);
    const crescente = await criarServico(undefined, repositorios).listar({ sort: 'net_worth_asc' });
    const decrescente = await criarServico(undefined, repositorios).listar({ sort: 'net_worth_desc' });
    expect(crescente.map(({ clube }) => clube.id)).toEqual([1, 2]);
    expect(decrescente.map(({ clube }) => clube.id)).toEqual([2, 1]);
  });
});

describe('ClubesService.consultar', () => {
  it('responde 404 CLUBE_NAO_ENCONTRADO para clube inexistente, sem ler o elenco', async () => {
    const repositorios = criarRepositorios();
    repositorios.clubes.findOneBy.mockResolvedValue(null);
    await expect(criarServico(undefined, repositorios).consultar(9)).rejects.toMatchObject({ codigo: 'CLUBE_NAO_ENCONTRADO', status: 404 });
    expect(repositorios.jogadores.find).not.toHaveBeenCalled();
  });

  it('devolve o elenco na ordem GOL→ATA, com dias e percentual de multa para uma venda agora', async () => {
    const repositorios = criarRepositorios();
    repositorios.clubes.findOneBy.mockResolvedValue(criarClube(1, 'Águias FC', 26115));
    repositorios.jogadores.find.mockResolvedValue([criarJogador(2, 'Meia Lua'), criarJogador(5, 'Zé Goleiro', { posicao: 'GOL', condicao: 'APTO' })]);
    repositorios.contratos.find.mockResolvedValue([criarContrato(2, new Date(agora.getTime() + 120 * umDia)), criarContrato(5, new Date(agora.getTime() - umDia))]);
    const resultado = await criarServico(undefined, repositorios).consultar(1);
    expect(repositorios.jogadores.find).toHaveBeenCalledWith({ where: { clubeId: 1, excluidoEm: IsNull() } });
    expect(repositorios.contratos.find).toHaveBeenCalledWith({ where: { clubeId: 1, situacao: 'ATIVO' } });
    expect(resultado.elenco.map(({ jogador, diasRestantes, percentualDeMulta }) => [jogador.id, diasRestantes, percentualDeMulta])).toEqual([
      [5, 0, 0],
      [2, 120, 10],
    ]);
    expect(resultado.valorDoElenco).toBe(7700);
  });

  it('falha com erro interno quando um jogador do elenco não tem contrato ATIVO', async () => {
    const repositorios = criarRepositorios();
    repositorios.clubes.findOneBy.mockResolvedValue(criarClube(1, 'Águias FC', 26115));
    repositorios.jogadores.find.mockResolvedValue([criarJogador(2, 'Meia Lua')]);
    await expect(criarServico(undefined, repositorios).consultar(1)).rejects.toThrow('Jogador 2 do clube 1 sem contrato ATIVO');
  });
});
