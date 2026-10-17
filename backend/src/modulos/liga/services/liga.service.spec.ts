import { DataSource, In, IsNull } from 'typeorm';
import { Relogio } from '@/core/comum/relogio/relogio';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import type { CondicaoJogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import type { EscalarDto } from '@/modulos/liga/dto/escalar.dto';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { LigaService } from '@/modulos/liga/services/liga.service';

const agora = new Date('2026-11-12T18:00:00Z');

function criarJogador(id: number, nome: string, posicao: PosicaoJogador, condicao: CondicaoJogador = 'APTO', clubeId: number | null = 1): Jogador {
  return Object.assign(new Jogador(), { id, nome, posicao, condicao, clubeId });
}

// Titulares do Águias FC no exemplo 2.4.1, em ordem de id (como o banco devolve)
function criarTitulares(): Jogador[] {
  return [
    criarJogador(30, 'Rui Prado', 'GOL'),
    criarJogador(31, 'Davi Lins', 'LAT', 'MAL_CONDICIONADO'),
    criarJogador(32, 'Téo Brandão', 'ZAG'),
    criarJogador(33, 'Lauro Neves', 'MEI'),
    criarJogador(34, 'Otto Rangel', 'ATA'),
  ];
}

const dados: EscalarDto = { formation: '2-1-1', player_ids: [34, 31, 30, 33, 32] };

function criarManager(titulares = criarTitulares(), clubeExiste = true) {
  return {
    existsBy: vi.fn().mockResolvedValue(clubeExiste),
    find: vi.fn().mockResolvedValue(titulares),
    findOneOrFail: vi.fn().mockResolvedValue(Object.assign(new Clube(), { id: 1, nome: 'Águias FC', formacao: null })),
    findOneBy: vi.fn().mockResolvedValue(Object.assign(new Clube(), { id: 1, nome: 'Águias FC', formacao: '2-1-1' })),
    create: vi.fn((entidade: new () => object, campos: object) => Object.assign(new entidade(), campos)),
    delete: vi.fn().mockResolvedValue({}),
    save: vi.fn((entidade: unknown) => Promise.resolve(entidade)),
  };
}

function criarServico(manager = criarManager()): LigaService {
  const dataSource = { manager, transaction: vi.fn((trabalho: (gerenciador: typeof manager) => Promise<unknown>) => trabalho(manager)) };
  return new LigaService(dataSource as unknown as DataSource, { agora: () => agora } as Relogio);
}

async function capturarErro(promessa: Promise<unknown>): Promise<RegraNegocioException> {
  const erro = await promessa.catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return erro as RegraNegocioException;
}

describe('LigaService.escalar', () => {
  it('trava os 5 jogadores em ordem de id e depois o clube (DEC-039)', async () => {
    const manager = criarManager();
    await criarServico(manager).escalar(1, dados);
    expect(manager.find).toHaveBeenCalledWith(Jogador, { where: { id: In([34, 31, 30, 33, 32]), excluidoEm: IsNull() }, order: { id: 'ASC' }, lock: { mode: 'pessimistic_write' } });
    expect(manager.findOneOrFail).toHaveBeenCalledWith(Clube, { where: { id: 1 }, lock: { mode: 'pessimistic_write' } });
    expect(manager.find.mock.invocationCallOrder[0]).toBeLessThan(manager.findOneOrFail.mock.invocationCallOrder[0]);
  });

  it('substitui a escalação: apaga a anterior, grava os 5 com o mesmo agora e a formação do clube', async () => {
    const manager = criarManager();
    await criarServico(manager).escalar(1, dados);
    expect(manager.delete).toHaveBeenCalledWith(Escalacao, { clubeId: 1 });
    expect(manager.delete.mock.invocationCallOrder[0]).toBeLessThan(manager.save.mock.invocationCallOrder[0]);
    const [linhas] = manager.save.mock.calls[0] as [Escalacao[]];
    expect(linhas.map((linha) => [linha.clubeId, linha.jogadorId, linha.criadoEm])).toEqual([30, 31, 32, 33, 34].map((id) => [1, id, agora]));
    expect(manager.save).toHaveBeenLastCalledWith(expect.objectContaining({ id: 1, formacao: '2-1-1' }));
  });

  it('devolve o clube e os titulares na ordem do elenco (RN11)', async () => {
    const { clube, titulares } = await criarServico().escalar(1, dados);
    expect(clube.formacao).toBe('2-1-1');
    expect(titulares.map((jogador) => jogador.id)).toEqual([30, 32, 31, 33, 34]);
  });

  it('clube inexistente → 404, antes de procurar os jogadores', async () => {
    const manager = criarManager(criarTitulares(), false);
    const erro = await capturarErro(criarServico(manager).escalar(99, dados));
    expect([erro.getStatus(), erro.codigo]).toEqual([404, 'CLUBE_NAO_ENCONTRADO']);
    expect(manager.find).not.toHaveBeenCalled();
  });

  it('jogador inexistente ou excluído (o banco devolve 4) → 404, sem travar o clube', async () => {
    const manager = criarManager(criarTitulares().slice(0, 4));
    const erro = await capturarErro(criarServico(manager).escalar(1, dados));
    expect([erro.getStatus(), erro.codigo]).toEqual([404, 'JOGADOR_NAO_ENCONTRADO']);
    expect(manager.findOneOrFail).not.toHaveBeenCalled();
  });

  it.each([
    ['de outro clube', 2],
    ['livre', null],
  ])('jogador %s → 409 JOGADOR_FORA_DO_ELENCO, nada gravado', async (_caso, clubeId) => {
    const titulares = criarTitulares();
    titulares[4].clubeId = clubeId;
    const manager = criarManager(titulares);
    const erro = await capturarErro(criarServico(manager).escalar(1, dados));
    expect([erro.getStatus(), erro.codigo, erro.message]).toEqual([409, 'JOGADOR_FORA_DO_ELENCO', 'O jogador Otto Rangel não é do elenco do Águias FC.']);
    expect(manager.delete).not.toHaveBeenCalled();
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('titular DOENTE → 409, nada gravado; MAL_CONDICIONADO pode', async () => {
    const titulares = criarTitulares();
    titulares[3].condicao = 'DOENTE';
    const manager = criarManager(titulares);
    const erro = await capturarErro(criarServico(manager).escalar(1, dados));
    expect([erro.getStatus(), erro.codigo, erro.message]).toEqual([409, 'JOGADOR_DOENTE_NAO_PODE_SER_ESCALADO', 'O jogador Lauro Neves está DOENTE e não pode ser escalado.']);
    expect(manager.delete).not.toHaveBeenCalled();
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('fora do elenco vem antes de DOENTE', async () => {
    const titulares = criarTitulares();
    titulares[0].condicao = 'DOENTE';
    titulares[4].clubeId = 2;
    const erro = await capturarErro(criarServico(criarManager(titulares)).escalar(1, dados));
    expect(erro.codigo).toBe('JOGADOR_FORA_DO_ELENCO');
  });

  it('posições que não fecham a formação (2-1-1 com 2 MEI) → 409, nada gravado', async () => {
    const titulares = criarTitulares();
    titulares[2].posicao = 'MEI';
    const manager = criarManager(titulares);
    const erro = await capturarErro(criarServico(manager).escalar(1, dados));
    expect([erro.getStatus(), erro.codigo, erro.message]).toEqual([409, 'POSICOES_NAO_FECHAM_A_FORMACAO', 'As posições dos titulares não fecham a formação 2-1-1.']);
    expect(manager.delete).not.toHaveBeenCalled();
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('DOENTE vem antes das posições', async () => {
    const titulares = criarTitulares();
    titulares[2].posicao = 'MEI';
    titulares[0].condicao = 'DOENTE';
    const erro = await capturarErro(criarServico(criarManager(titulares)).escalar(1, dados));
    expect(erro.codigo).toBe('JOGADOR_DOENTE_NAO_PODE_SER_ESCALADO');
  });
});

describe('LigaService.consultarEscalacao', () => {
  it('devolve o clube e os titulares que restam, na ordem do elenco', async () => {
    const manager = criarManager();
    manager.find.mockResolvedValue([34, 31, 30].map((id) => Object.assign(new Escalacao(), { clubeId: 1, jogadorId: id, jogador: criarTitulares().find((jogador) => jogador.id === id) })));
    const { clube, titulares } = await criarServico(manager).consultarEscalacao(1);
    expect(manager.find).toHaveBeenCalledWith(Escalacao, { where: { clubeId: 1 }, relations: { jogador: true } });
    expect(clube.formacao).toBe('2-1-1');
    expect(titulares.map((jogador) => jogador.id)).toEqual([30, 31, 34]);
  });

  it('nunca escalou: nenhum titular', async () => {
    const manager = criarManager();
    manager.find.mockResolvedValue([]);
    await expect(criarServico(manager).consultarEscalacao(1)).resolves.toMatchObject({ titulares: [] });
  });

  it('clube inexistente → 404', async () => {
    const manager = criarManager();
    manager.findOneBy.mockResolvedValue(null);
    const erro = await capturarErro(criarServico(manager).consultarEscalacao(99));
    expect([erro.getStatus(), erro.codigo]).toEqual([404, 'CLUBE_NAO_ENCONTRADO']);
    expect(manager.find).not.toHaveBeenCalled();
  });

  it('linha de escalação sem o jogador é erro interno', async () => {
    const manager = criarManager();
    manager.find.mockResolvedValue([Object.assign(new Escalacao(), { clubeId: 1, jogadorId: 30 })]);
    await expect(criarServico(manager).consultarEscalacao(1)).rejects.toThrow('Escalação do clube 1 sem o jogador');
  });
});
