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
});
