import { criarTransacaoResposta } from '@/modulos/mercado/dto/transacao-resposta.dto';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';

describe('criarTransacaoResposta', () => {
  // Venda do exemplo 2.3.2: o lucro sai como número, com sinal
  it('converte os centavos, mantém o nome gravado e formata a data em Brasília', () => {
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
    expect(criarTransacaoResposta(transacao)).toEqual({
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
    });
  });

  it('mantém o sinal do prejuízo', () => {
    const transacao = Object.assign(new Transacao(), { lucro: -39, valor: 0, taxa: 0, multa: 0, variacaoCaixa: 0, criadoEm: new Date('2026-11-05T19:40:00Z') });
    expect(criarTransacaoResposta(transacao).profit).toBe(-0.39);
  });
});
