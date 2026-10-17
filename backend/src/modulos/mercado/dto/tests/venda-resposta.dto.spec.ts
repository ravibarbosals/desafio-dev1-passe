import { criarVendaResposta } from '@/modulos/mercado/dto/venda-resposta.dto';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';

describe('criarVendaResposta', () => {
  it('monta a resposta do exemplo 2.3.2 do enunciado', () => {
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
    expect(criarVendaResposta({ transacao, contrato, caixaDoClube: 29685, diasRestantes: 117, percentualDeMulta: 10 })).toEqual({
      id: 11,
      club_id: 1,
      player_id: 2,
      player_name: 'Meia Lua',
      type: 'VENDA',
      value: 40,
      fee: 0.3,
      penalty: 4,
      profit: 3,
      cash_change: 35.7,
      created_at: '2026-11-05T16:40:00-03:00',
      purchase_value: 37,
      remaining_days: 117,
      penalty_rate: 10,
      contract_status: 'RESCINDIDO',
      club_cash: 296.85,
    });
  });
});
