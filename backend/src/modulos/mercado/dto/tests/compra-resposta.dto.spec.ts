import { criarCompraResposta } from '@/modulos/mercado/dto/compra-resposta.dto';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';

describe('criarCompraResposta', () => {
  it('monta a resposta do exemplo 2.3.1 do enunciado', () => {
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
    expect(criarCompraResposta({ transacao, contrato, caixaDoClube: 26115 })).toEqual({
      id: 10,
      club_id: 1,
      player_id: 2,
      player_name: 'Meia Lua',
      type: 'COMPRA',
      value: 37,
      fee: 1.85,
      penalty: 0,
      profit: null,
      cash_change: -38.85,
      created_at: '2026-11-02T10:15:00-03:00',
      contract: { purchase_value: 37, loyalty_until: '2027-03-02T10:15:00-03:00', status: 'ATIVO' },
      club_cash: 261.15,
    });
  });
});
