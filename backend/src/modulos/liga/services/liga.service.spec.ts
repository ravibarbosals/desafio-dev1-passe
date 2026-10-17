import { DataSource, In, IsNull } from 'typeorm';
import { Relogio } from '@/core/comum/relogio/relogio';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import type { CondicaoJogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import type { EscalarDto } from '@/modulos/liga/dto/escalar.dto';
import { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { Partida } from '@/modulos/liga/entities/partida.entity';
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

describe('LigaService.jogar', () => {
  const aguias = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', formacao: '2-1-1' });
  const delta = Object.assign(new Clube(), { id: 2, nome: 'Delta FC', formacao: '2-1-1' });

  function titularDoExemplo(clube: Clube, id: number, nome: string, posicao: PosicaoJogador, atributos: Partial<Jogador>, condicao: CondicaoJogador = 'APTO'): Escalacao {
    const jogador = Object.assign(new Jogador(), { id, nome, posicao, condicao, clubeId: clube.id, finalizacao: 11, passe: 22, drible: 33, defesa: 44 }, atributos);
    return Object.assign(new Escalacao(), { clubeId: clube.id, jogadorId: id, jogador, clube });
  }

  // Exemplo completo da RN20, em ordem de id do jogador (como a consulta devolve)
  function criarEscalacoes(): Escalacao[] {
    return [
      titularDoExemplo(aguias, 30, 'Rui Prado', 'GOL', { defesa: 77 }),
      titularDoExemplo(aguias, 31, 'Davi Lins', 'LAT', { drible: 74, defesa: 66 }, 'MAL_CONDICIONADO'),
      titularDoExemplo(aguias, 32, 'Téo Brandão', 'ZAG', { defesa: 84 }),
      titularDoExemplo(aguias, 33, 'Lauro Neves', 'MEI', { passe: 82 }),
      titularDoExemplo(aguias, 34, 'Otto Rangel', 'ATA', { finalizacao: 75 }),
      titularDoExemplo(delta, 40, 'Ivo Teles', 'GOL', { defesa: 72 }),
      titularDoExemplo(delta, 41, 'Hugo Vaz', 'ZAG', { defesa: 84 }),
      titularDoExemplo(delta, 42, 'Lino Matos', 'LAT', { drible: 79, defesa: 63 }),
      titularDoExemplo(delta, 43, 'Nei Soares', 'MEI', { passe: 70 }),
      titularDoExemplo(delta, 44, 'Ugo Falcão', 'ATA', { finalizacao: 81 }),
    ];
  }

  function criarManagerDaPartida(escalacoes = criarEscalacoes(), clubes: (Clube | null)[] = [aguias, delta]) {
    const consulta = {
      innerJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      setLock: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue(escalacoes),
    };
    const manager = Object.assign(criarManager(), {
      findOneBy: vi.fn().mockResolvedValueOnce(clubes[0]).mockResolvedValueOnce(clubes[1]),
      createQueryBuilder: vi.fn().mockReturnValue(consulta),
      save: vi.fn((entidade: unknown) => Promise.resolve(entidade instanceof Partida ? Object.assign(entidade, { id: 7 }) : entidade)),
    });
    return { manager, consulta };
  }

  const dadosDaPartida = { home_club_id: 1, away_club_id: 2 };

  it('lê os clubes sem trava e a escalação numa consulta que trava só os jogadores, em ordem de id', async () => {
    const { manager, consulta } = criarManagerDaPartida();
    await criarServico(manager).jogar(dadosDaPartida);
    expect(manager.findOneBy.mock.calls).toEqual([
      [Clube, { id: 1 }],
      [Clube, { id: 2 }],
    ]);
    expect(manager.createQueryBuilder).toHaveBeenCalledWith(Escalacao, 'escalacao');
    expect(consulta.where).toHaveBeenCalledWith('escalacao.clube_id IN (:...clubeIds)', { clubeIds: [1, 2] });
    expect(consulta.orderBy).toHaveBeenCalledWith('jogador.id', 'ASC');
    expect(consulta.setLock).toHaveBeenCalledWith('pessimistic_write', undefined, ['jogador']);
  });

  it('grava o exemplo da RN20: Águias FC 1 × 2 Delta FC, formações, agora e os 6 duelos da partida', async () => {
    const { manager } = criarManagerDaPartida();
    const partida = await criarServico(manager).jogar(dadosDaPartida);
    expect(partida).toMatchObject({
      id: 7,
      mandanteId: 1,
      visitanteId: 2,
      golsMandante: 1,
      golsVisitante: 2,
      formacaoMandante: '2-1-1',
      formacaoVisitante: '2-1-1',
      jogadaEm: agora,
      mandante: aguias,
      visitante: delta,
    });
    const [duelos] = manager.save.mock.calls[1] as [DueloPartida[]];
    expect(duelos.map((duelo) => [duelo.partidaId, duelo.ordem, duelo.atacanteId, duelo.defensorId, duelo.gol])).toEqual([
      [7, 1, 34, 40, true],
      [7, 2, 33, 41, false],
      [7, 3, 31, 42, false],
      [7, 4, 44, 30, true],
      [7, 5, 43, 32, false],
      [7, 6, 42, 31, true],
    ]);
    expect(duelos[0]).toBeInstanceOf(DueloPartida);
    expect(partida.duelos).toBe(duelos);
  });

  it('cada lado grava a formação do próprio clube', async () => {
    const deltaNoDoisDois = Object.assign(new Clube(), { id: 2, nome: 'Delta FC', formacao: '2-2' });
    const escalacoes = criarEscalacoes().map((linha) => (linha.clubeId === 2 ? Object.assign(linha, { clube: deltaNoDoisDois }) : linha));
    const { manager } = criarManagerDaPartida(escalacoes);
    await expect(criarServico(manager).jogar(dadosDaPartida)).resolves.toMatchObject({ formacaoMandante: '2-1-1', formacaoVisitante: '2-2' });
  });

  it('mandante inexistente → 404, antes do visitante e sem ler escalação', async () => {
    const { manager } = criarManagerDaPartida(criarEscalacoes(), [null, delta]);
    const erro = await capturarErro(criarServico(manager).jogar(dadosDaPartida));
    expect([erro.getStatus(), erro.codigo]).toEqual([404, 'CLUBE_NAO_ENCONTRADO']);
    expect(manager.findOneBy).toHaveBeenCalledTimes(1);
    expect(manager.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('visitante inexistente → 404, sem ler escalação', async () => {
    const { manager } = criarManagerDaPartida(criarEscalacoes(), [aguias, null]);
    const erro = await capturarErro(criarServico(manager).jogar(dadosDaPartida));
    expect([erro.getStatus(), erro.codigo]).toEqual([404, 'CLUBE_NAO_ENCONTRADO']);
    expect(manager.createQueryBuilder).not.toHaveBeenCalled();
  });

  it.each([
    ['mandante nunca escalou', (escalacoes: Escalacao[]) => escalacoes.filter((linha) => linha.clubeId !== 1), 'Águias FC'],
    ['visitante perdeu um titular', (escalacoes: Escalacao[]) => escalacoes.filter((linha) => linha.jogadorId !== 44), 'Delta FC'],
    [
      'titular vendido enquanto a partida esperava a trava',
      (escalacoes: Escalacao[]) => escalacoes.map((linha) => (linha.jogadorId === 31 ? Object.assign(linha, { jogador: Object.assign(new Jogador(), linha.jogador, { clubeId: null }) }) : linha)),
      'Águias FC',
    ],
    [
      'titular virou DOENTE enquanto a partida esperava a trava',
      (escalacoes: Escalacao[]) => escalacoes.map((linha) => (linha.jogadorId === 43 ? Object.assign(linha, { jogador: Object.assign(new Jogador(), linha.jogador, { condicao: 'DOENTE' }) }) : linha)),
      'Delta FC',
    ],
  ])('%s → 409 ESCALACAO_INCOMPLETA, nada gravado', async (_caso, alterar, nome) => {
    const { manager } = criarManagerDaPartida(alterar(criarEscalacoes()));
    const erro = await capturarErro(criarServico(manager).jogar(dadosDaPartida));
    expect([erro.getStatus(), erro.codigo, erro.message]).toEqual([409, 'ESCALACAO_INCOMPLETA', `O clube ${nome} não tem a escalação completa.`]);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('escalação sem formação gravada é incompleta', async () => {
    const semFormacao = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', formacao: null });
    const escalacoes = criarEscalacoes().map((linha) => (linha.clubeId === 1 ? Object.assign(linha, { clube: semFormacao }) : linha));
    const { manager } = criarManagerDaPartida(escalacoes);
    const erro = await capturarErro(criarServico(manager).jogar(dadosDaPartida));
    expect(erro.codigo).toBe('ESCALACAO_INCOMPLETA');
  });
});

describe('LigaService.listarPartidas', () => {
  const partidas = [Object.assign(new Partida(), { id: 8 }), Object.assign(new Partida(), { id: 7 })];

  function criarManagerDaLista(clubeExiste = true) {
    return Object.assign(criarManager(), { existsBy: vi.fn().mockResolvedValue(clubeExiste), find: vi.fn().mockResolvedValue(partidas) });
  }

  it('sem filtro: todas, com os clubes, da mais recente para a mais antiga (id desempata)', async () => {
    const manager = criarManagerDaLista();
    await expect(criarServico(manager).listarPartidas({})).resolves.toBe(partidas);
    expect(manager.existsBy).not.toHaveBeenCalled();
    expect(manager.find).toHaveBeenCalledWith(Partida, { where: {}, relations: { mandante: true, visitante: true }, order: { jogadaEm: 'DESC', id: 'DESC' } });
  });

  it('club_id: o clube como mandante ou visitante (RN21)', async () => {
    const manager = criarManagerDaLista();
    await criarServico(manager).listarPartidas({ club_id: 2 });
    expect(manager.existsBy).toHaveBeenCalledWith(Clube, { id: 2 });
    expect(manager.find).toHaveBeenCalledWith(Partida, expect.objectContaining({ where: [{ mandanteId: 2 }, { visitanteId: 2 }] }));
  });

  it('clube do filtro inexistente → 404, sem listar', async () => {
    const manager = criarManagerDaLista(false);
    const erro = await capturarErro(criarServico(manager).listarPartidas({ club_id: 99 }));
    expect([erro.getStatus(), erro.codigo]).toEqual([404, 'CLUBE_NAO_ENCONTRADO']);
    expect(manager.find).not.toHaveBeenCalled();
  });
});

describe('LigaService.consultarPartida', () => {
  it('traz a partida com os clubes e os duelos', async () => {
    const partida = Object.assign(new Partida(), { id: 7 });
    const manager = Object.assign(criarManager(), { findOne: vi.fn().mockResolvedValue(partida) });
    await expect(criarServico(manager).consultarPartida(7)).resolves.toBe(partida);
    expect(manager.findOne).toHaveBeenCalledWith(Partida, { where: { id: 7 }, relations: { mandante: true, visitante: true, duelos: true } });
  });

  it('partida inexistente → 404 PARTIDA_NAO_ENCONTRADA (nunca 200 vazio)', async () => {
    const manager = Object.assign(criarManager(), { findOne: vi.fn().mockResolvedValue(null) });
    const erro = await capturarErro(criarServico(manager).consultarPartida(999));
    expect([erro.getStatus(), erro.codigo, erro.message]).toEqual([404, 'PARTIDA_NAO_ENCONTRADA', 'Partida não encontrada.']);
  });
});
