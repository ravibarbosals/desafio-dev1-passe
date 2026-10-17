import { resumirHistorico } from '@/modulos/mercado/helpers/resumo-do-historico';
import type { TransacaoDoResumo } from '@/modulos/mercado/helpers/resumo-do-historico';

// Compra e venda do Meia Lua (exemplos 2.3.1 e 2.3.2)
const compra: TransacaoDoResumo = { tipo: 'COMPRA', valor: 3700, taxa: 185, multa: 0, lucro: null, variacaoCaixa: -3885 };
const venda: TransacaoDoResumo = { tipo: 'VENDA', valor: 4000, taxa: 30, multa: 400, lucro: 300, variacaoCaixa: 3570 };
// Venda com prejuízo da tabela da RN16: lucro −7,50, sem comissão
const vendaComPrejuizo: TransacaoDoResumo = { tipo: 'VENDA', valor: 4250, taxa: 0, multa: 850, lucro: -750, variacaoCaixa: 3400 };

describe('resumirHistorico', () => {
  it('sem filtro, como na observação do 2.3.3: 38,85 / 35,70 / 2,15 / 4,00 / 3,00', () => {
    expect(resumirHistorico([venda, compra])).toEqual({ totalGasto: 3885, totalRecebido: 3570, totalTaxas: 215, totalMultas: 400, totalLucro: 300 });
  });

  it('só a VENDA, como no exemplo 2.3.3', () => {
    expect(resumirHistorico([venda])).toEqual({ totalGasto: 0, totalRecebido: 3570, totalTaxas: 30, totalMultas: 400, totalLucro: 300 });
  });

  it('só a COMPRA: gasto = valor + taxa, e nada de venda', () => {
    expect(resumirHistorico([compra])).toEqual({ totalGasto: 3885, totalRecebido: 0, totalTaxas: 185, totalMultas: 0, totalLucro: 0 });
  });

  it('o prejuízo entra no lucro com sinal', () => {
    expect(resumirHistorico([venda, vendaComPrejuizo])).toEqual({ totalGasto: 0, totalRecebido: 6970, totalTaxas: 30, totalMultas: 1250, totalLucro: -450 });
  });

  it('lista vazia → tudo zero', () => {
    expect(resumirHistorico([])).toEqual({ totalGasto: 0, totalRecebido: 0, totalTaxas: 0, totalMultas: 0, totalLucro: 0 });
  });
});
