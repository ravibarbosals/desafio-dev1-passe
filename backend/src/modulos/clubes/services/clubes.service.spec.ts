import { DataSource, QueryFailedError } from 'typeorm';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { ClubesService } from '@/modulos/clubes/services/clubes.service';

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

function criarServico(manager: ReturnType<typeof criarManager>): ClubesService {
  const dataSource = { transaction: vi.fn((trabalho: (gerenciador: typeof manager) => Promise<unknown>) => trabalho(manager)) };
  return new ClubesService(dataSource as unknown as DataSource);
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
