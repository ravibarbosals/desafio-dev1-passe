import { criarHistoricoResposta } from '@/modulos/mercado/dto/historico-resposta.dto';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';

describe('criarHistoricoResposta', () => {
  it('monta a resposta do exemplo 2.3.3 do enunciado', () => {
    const venda = Object.assign(new Transacao(), {
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
    const resumo = { totalGasto: 0, totalRecebido: 3570, totalTaxas: 30, totalMultas: 400, totalLucro: 300 };
    expect(criarHistoricoResposta({ transacoes: [venda], resumo })).toEqual({
      data: [
        {
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
        },
      ],
      summary: { total_spent: 0, total_received: 35.7, total_fees: 0.3, total_penalties: 4, total_profit: 3 },
    });
  });

  it('sem transações: data vazia e summary zerado', () => {
    const resumo = { totalGasto: 0, totalRecebido: 0, totalTaxas: 0, totalMultas: 0, totalLucro: 0 };
    expect(criarHistoricoResposta({ transacoes: [], resumo })).toEqual({
      data: [],
      summary: { total_spent: 0, total_received: 0, total_fees: 0, total_penalties: 0, total_profit: 0 },
    });
  });
});
