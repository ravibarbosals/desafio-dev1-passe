import { MercadoController } from '@/modulos/mercado/controllers/mercado.controller';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';
import { MercadoService } from '@/modulos/mercado/services/mercado.service';

describe('MercadoController', () => {
  it('compra pelo id da URL e responde com a transação, o contrato e o caixa', async () => {
    const transacao = Object.assign(new Transacao(), {
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
      criadoEm: new Date('2026-11-02T13:15:00Z'),
    });
    const contrato = Object.assign(new Contrato(), { valorCompra: 3700, fidelidadeAte: new Date('2027-03-02T13:15:00Z'), situacao: 'ATIVO' });
    const servico = { comprar: vi.fn().mockResolvedValue({ transacao, contrato, caixaDoClube: 26115 }) };
    const dados = { club_id: 1, loyalty_until: new Date('2027-03-02T13:15:00Z') };
    const corpo = await new MercadoController(servico as unknown as MercadoService).comprar(2, dados);
    expect(servico.comprar).toHaveBeenCalledWith(2, dados);
    expect(corpo).toMatchObject({ id: 10, type: 'COMPRA', cash_change: -38.85, contract: { status: 'ATIVO' }, club_cash: 261.15 });
  });

  it('vende pelo id da URL e responde com a transação, o contrato e o caixa', async () => {
    const transacao = Object.assign(new Transacao(), {
      id: 11,
      clubeId: 1,
      jogadorId: 2,
      nomeJogador: 'Meia Lua',
      tipo: 'VENDA',
      valor: 4000,
      taxa: 30,
      multa: 400,
      lucro: 300,
      variacaoCaixa: 3570,
      criadoEm: new Date('2026-11-05T19:40:00Z'),
    });
    const contrato = Object.assign(new Contrato(), { valorCompra: 3700, situacao: 'RESCINDIDO' });
    const servico = { vender: vi.fn().mockResolvedValue({ transacao, contrato, caixaDoClube: 29685, diasRestantes: 117, percentualDeMulta: 10 }) };
    const corpo = await new MercadoController(servico as unknown as MercadoService).vender(2);
    expect(servico.vender).toHaveBeenCalledWith(2);
    expect(corpo).toMatchObject({ id: 11, type: 'VENDA', cash_change: 35.7, remaining_days: 117, penalty_rate: 10, contract_status: 'RESCINDIDO', club_cash: 296.85 });
  });

  it('consulta o histórico pelo id da URL, com os filtros recebidos', async () => {
    const resumo = { totalGasto: 0, totalRecebido: 0, totalTaxas: 0, totalMultas: 0, totalLucro: 0 };
    const servico = { consultarHistorico: vi.fn().mockResolvedValue({ transacoes: [], resumo }) };
    const corpo = await new MercadoController(servico as unknown as MercadoService).consultarHistorico(1, { type: ['VENDA'] });
    expect(servico.consultarHistorico).toHaveBeenCalledWith(1, { type: ['VENDA'] });
    expect(corpo).toEqual({ data: [], summary: { total_spent: 0, total_received: 0, total_fees: 0, total_penalties: 0, total_profit: 0 } });
  });
});
