import { DataSource } from 'typeorm';
import { Relogio } from '@/core/comum/relogio/relogio';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';
import { MercadoService } from '@/modulos/mercado/services/mercado.service';

// 02/11/2026, 10h15 em Brasília (exemplo 2.3.1)
const agora = new Date('2026-11-02T13:15:00Z');
const fidelidade = new Date('2027-03-02T13:15:00Z');
const umDia = 24 * 60 * 60 * 1000;

// Valor base 40,00, MAL_CONDICIONADO, agilidade 85, 25 anos: valor de mercado 37,00 (exemplo 2.1.4)
function criarJogador(campos: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), { id: 2, nome: 'Meia Lua', valorBase: 4000, condicao: 'MAL_CONDICIONADO', agilidade: 85, idade: 25, clubeId: null, ...campos });
}

function criarClube(caixa = 30000): Clube {
  return Object.assign(new Clube(), { id: 1, nome: 'Águias FC', caixa });
}

// A transação simulada só executa o trabalho com o manager; findOne devolve o jogador e depois o clube (DEC-039)
function criarManager(jogador: Jogador | null = criarJogador(), clube: Clube | null = criarClube()) {
  return {
    findOne: vi.fn().mockResolvedValueOnce(jogador).mockResolvedValueOnce(clube),
    findOneBy: vi.fn().mockResolvedValue(null),
    existsBy: vi.fn().mockResolvedValue(false),
    countBy: vi.fn().mockResolvedValue(0),
    create: vi.fn((entidade: new () => object, dados: object) => Object.assign(new entidade(), dados)),
    delete: vi.fn().mockResolvedValue({}),
    save: vi.fn((entidade: object) => Promise.resolve(entidade instanceof Transacao ? Object.assign(entidade, { id: 10 }) : entidade)),
  };
}

function criarServico(manager = criarManager(), instante = agora): MercadoService {
  const dataSource = { transaction: vi.fn((trabalho: (gerenciador: typeof manager) => Promise<unknown>) => trabalho(manager)) };
  return new MercadoService(dataSource as unknown as DataSource, { agora: () => instante } as Relogio);
}

async function capturarErro(promessa: Promise<unknown>): Promise<RegraNegocioException> {
  const erro = await promessa.catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return erro as RegraNegocioException;
}

describe('MercadoService.comprar', () => {
  it('compra no exemplo 2.3.1: caixa, jogador, contrato ATIVO e transação COMPRA com o mesmo "agora"', async () => {
    const jogador = criarJogador();
    const clube = criarClube();
    const manager = criarManager(jogador, clube);
    const compra = await criarServico(manager).comprar(2, { club_id: 1, loyalty_until: fidelidade });
    expect(manager.findOne).toHaveBeenNthCalledWith(1, Jogador, expect.objectContaining({ where: expect.objectContaining({ id: 2 }), lock: { mode: 'pessimistic_write' } }));
    expect(manager.findOne).toHaveBeenNthCalledWith(2, Clube, { where: { id: 1 }, lock: { mode: 'pessimistic_write' } });
    expect(manager.existsBy).toHaveBeenCalledWith(Transacao, { clubeId: 1, jogadorId: 2, tipo: 'VENDA' });
    expect(manager.countBy).toHaveBeenCalledWith(Jogador, { clubeId: 1 });
    expect(manager.save).toHaveBeenCalledWith(clube);
    expect(manager.save).toHaveBeenCalledWith(jogador);
    expect(clube.caixa).toBe(26115);
    expect(jogador.clubeId).toBe(1);
    expect(compra.caixaDoClube).toBe(26115);
    expect(compra.contrato).toEqual(Object.assign(new Contrato(), { jogadorId: 2, clubeId: 1, valorCompra: 3700, fidelidadeAte: fidelidade, situacao: 'ATIVO', iniciadoEm: agora, encerradoEm: null }));
    expect(compra.transacao).toEqual(
      Object.assign(new Transacao(), {
        id: 10,
        clubeId: 1,
        jogadorId: 2,
        nomeJogador: 'Meia Lua',
        tipo: 'COMPRA',
        valor: 3700,
        taxa: 185,
        multa: 0,
        lucro: null,
        variacaoCaixa: -3885,
        criadoEm: agora,
      }),
    );
  });

  it.each([
    ['o próprio instante de agora', agora],
    ['no passado', new Date(agora.getTime() - umDia)],
    ['além de 1.095 dias', new Date(agora.getTime() + 1095 * umDia + 60_000)],
  ])('recusa a fidelidade %s com 400 antes de qualquer consulta', async (_caso, loyalty_until) => {
    const manager = criarManager();
    const erro = await capturarErro(criarServico(manager).comprar(2, { club_id: 1, loyalty_until }));
    expect(erro.codigo).toBe('FIDELIDADE_FORA_DO_PRAZO');
    expect(erro.getStatus()).toBe(400);
    expect(manager.findOne).not.toHaveBeenCalled();
  });

  it('aceita a fidelidade em exatamente 1.095 dias', async () => {
    await expect(criarServico().comprar(2, { club_id: 1, loyalty_until: new Date(agora.getTime() + 1095 * umDia) })).resolves.toBeDefined();
  });

  it('jogador inexistente ou excluído → 404, sem travar o clube', async () => {
    const manager = criarManager(null);
    const erro = await capturarErro(criarServico(manager).comprar(99, { club_id: 1, loyalty_until: fidelidade }));
    expect(erro.codigo).toBe('JOGADOR_NAO_ENCONTRADO');
    expect(manager.findOne).toHaveBeenCalledTimes(1);
  });

  it('clube inexistente → 404', async () => {
    const erro = await capturarErro(criarServico(criarManager(criarJogador(), null)).comprar(2, { club_id: 99, loyalty_until: fidelidade }));
    expect(erro.codigo).toBe('CLUBE_NAO_ENCONTRADO');
    expect(erro.getStatus()).toBe(404);
  });

  it.each([
    ['de outro clube', 3],
    ['do próprio clube comprador', 1],
  ])('jogador %s → 409 JOGADOR_NAO_ESTA_LIVRE', async (_caso, clubeId) => {
    const manager = criarManager(criarJogador({ clubeId }));
    const erro = await capturarErro(criarServico(manager).comprar(2, { club_id: 1, loyalty_until: fidelidade }));
    expect(erro.codigo).toBe('JOGADOR_NAO_ESTA_LIVRE');
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('clube que já vendeu o jogador → 409 RECOMPRA_PELO_CLUBE_VENDEDOR', async () => {
    const manager = criarManager();
    manager.existsBy.mockResolvedValue(true);
    const erro = await capturarErro(criarServico(manager).comprar(2, { club_id: 1, loyalty_until: fidelidade }));
    expect(erro.codigo).toBe('RECOMPRA_PELO_CLUBE_VENDEDOR');
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('elenco com 12 → 409 ELENCO_CHEIO; com 11 compra', async () => {
    const cheio = criarManager();
    cheio.countBy.mockResolvedValue(12);
    expect((await capturarErro(criarServico(cheio).comprar(2, { club_id: 1, loyalty_until: fidelidade }))).codigo).toBe('ELENCO_CHEIO');
    expect(cheio.save).not.toHaveBeenCalled();
    const comVaga = criarManager();
    comVaga.countBy.mockResolvedValue(11);
    await expect(criarServico(comVaga).comprar(2, { club_id: 1, loyalty_until: fidelidade })).resolves.toBeDefined();
  });

  // Tabela da RN13 e caixa 261,15 (limite 130,575); APTO com 25 anos: valor de mercado = valor base
  it.each([
    [30000, 2800, 27200],
    [30000, 3000, 27000],
    [30000, 3001, 26849],
    [10000, 4762, 5000],
    [26115, 12435, 13058],
  ])('caixa %d e valor %d → aceita, caixa final %d', async (caixa, valorBase, caixaFinal) => {
    const manager = criarManager(criarJogador({ condicao: 'APTO', valorBase }), criarClube(caixa));
    await expect(criarServico(manager).comprar(2, { club_id: 1, loyalty_until: fidelidade })).resolves.toMatchObject({ caixaDoClube: caixaFinal });
  });

  it.each([
    [10000, 4800, 'O custo da compra (50,40) passa de 50% do caixa (100,00).'],
    [26115, 12436, 'O custo da compra (130,58) passa de 50% do caixa (261,15).'],
  ])('caixa %d e valor %d → 409 CUSTO_ACIMA_DO_LIMITE_DE_CAIXA', async (caixa, valorBase, mensagem) => {
    const manager = criarManager(criarJogador({ condicao: 'APTO', valorBase }), criarClube(caixa));
    const erro = await capturarErro(criarServico(manager).comprar(2, { club_id: 1, loyalty_until: fidelidade }));
    expect(erro.codigo).toBe('CUSTO_ACIMA_DO_LIMITE_DE_CAIXA');
    expect(erro.message).toBe(mensagem);
    expect(manager.save).not.toHaveBeenCalled();
  });
});

describe('MercadoService.vender', () => {
  // Exemplo 2.3.2: venda em 05/11/2026, 16h40 em Brasília, do contrato da compra do 2.3.1
  const momentoDaVenda = new Date('2026-11-05T19:40:00Z');

  function criarContrato(valorCompra = 3700, fidelidadeAte = fidelidade): Contrato {
    return Object.assign(new Contrato(), { id: 1, jogadorId: 2, clubeId: 1, valorCompra, fidelidadeAte, situacao: 'ATIVO', iniciadoEm: agora, encerradoEm: null });
  }

  function criarManagerDaVenda(jogador: Jogador | null, contrato: Contrato | null = criarContrato(), clube = criarClube(26115)) {
    const manager = criarManager(jogador, clube);
    manager.findOneBy.mockResolvedValue(contrato);
    return manager;
  }

  it('vende no exemplo 2.3.2: caixa, jogador livre, contrato RESCINDIDO, escalação e transação VENDA com o mesmo "agora"', async () => {
    const jogador = criarJogador({ condicao: 'APTO', clubeId: 1 });
    const clube = criarClube(26115);
    const contrato = criarContrato();
    const manager = criarManagerDaVenda(jogador, contrato, clube);
    const venda = await criarServico(manager, momentoDaVenda).vender(2);
    expect(manager.findOne).toHaveBeenNthCalledWith(1, Jogador, expect.objectContaining({ where: expect.objectContaining({ id: 2 }), lock: { mode: 'pessimistic_write' } }));
    expect(manager.findOne).toHaveBeenNthCalledWith(2, Clube, { where: { id: 1 }, lock: { mode: 'pessimistic_write' } });
    expect(manager.findOneBy).toHaveBeenCalledWith(Contrato, { jogadorId: 2, clubeId: 1, situacao: 'ATIVO' });
    expect(manager.save).toHaveBeenCalledWith(clube);
    expect(manager.save).toHaveBeenCalledWith(jogador);
    expect(manager.save).toHaveBeenCalledWith(contrato);
    expect(manager.delete).toHaveBeenCalledWith(Escalacao, { jogadorId: 2 });
    expect(clube.caixa).toBe(29685);
    expect(jogador.clubeId).toBeNull();
    expect(contrato).toMatchObject({ situacao: 'RESCINDIDO', encerradoEm: momentoDaVenda });
    expect(venda).toMatchObject({ caixaDoClube: 29685, diasRestantes: 117, percentualDeMulta: 10 });
    expect(venda.transacao).toEqual(
      Object.assign(new Transacao(), {
        id: 10,
        clubeId: 1,
        jogadorId: 2,
        nomeJogador: 'Meia Lua',
        tipo: 'VENDA',
        valor: 4000,
        taxa: 30,
        multa: 400,
        lucro: 300,
        variacaoCaixa: 3570,
        criadoEm: momentoDaVenda,
      }),
    );
  });

  // Tabela de venda da RN16; APTO com 25 anos: valor de mercado = valor base; os dias até o fim da fidelidade dão o percentual
  it.each([
    [3700, 4000, 100, 400, 300, 30, 3570, 'RESCINDIDO'],
    [5000, 4250, 200, 850, -750, 0, 3400, 'RESCINDIDO'],
    [2615, 3000, 10, 150, 385, 39, 2811, 'RESCINDIDO'],
    [2500, 2500, 0, 0, 0, 0, 2500, 'ENCERRADO'],
    [6000, 7500, 200, 1000, 1500, 200, 6300, 'RESCINDIDO'],
  ])('compra %d, venda %d, %d dias → multa %d, lucro %d, comissão %d, crédito %d, %s', async (valorCompra, valorBase, dias, multa, lucro, comissao, credito, situacao) => {
    const contrato = criarContrato(valorCompra, new Date(agora.getTime() + dias * umDia));
    const manager = criarManagerDaVenda(criarJogador({ condicao: 'APTO', valorBase, clubeId: 1 }), contrato, criarClube(10000));
    const venda = await criarServico(manager).vender(2);
    expect(venda.transacao).toMatchObject({ valor: valorBase, multa, lucro, taxa: comissao, variacaoCaixa: credito });
    expect(venda.caixaDoClube).toBe(10000 + credito);
    expect(contrato.situacao).toBe(situacao);
  });

  it('jogador inexistente ou excluído → 404', async () => {
    const erro = await capturarErro(criarServico(criarManagerDaVenda(null)).vender(99));
    expect(erro.codigo).toBe('JOGADOR_NAO_ENCONTRADO');
  });

  it('jogador livre → 409 JOGADOR_LIVRE_NAO_PODE_SER_VENDIDO, sem travar clube nem gravar', async () => {
    const manager = criarManagerDaVenda(criarJogador());
    const erro = await capturarErro(criarServico(manager).vender(2));
    expect(erro.codigo).toBe('JOGADOR_LIVRE_NAO_PODE_SER_VENDIDO');
    expect(manager.findOne).toHaveBeenCalledTimes(1);
    expect(manager.save).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it('jogador com clube e sem contrato ATIVO é dado corrompido: erro interno, sem gravar', async () => {
    const manager = criarManagerDaVenda(criarJogador({ clubeId: 1 }), null);
    await expect(criarServico(manager).vender(2)).rejects.toThrow('Jogador 2 do clube 1 sem contrato ATIVO');
    expect(manager.save).not.toHaveBeenCalled();
  });
});
