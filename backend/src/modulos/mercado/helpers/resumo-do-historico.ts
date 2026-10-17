import type { Transacao } from '@/modulos/mercado/entities/transacao.entity';

export interface ResumoDoHistorico {
  totalGasto: number;
  totalRecebido: number;
  totalTaxas: number;
  totalMultas: number;
  totalLucro: number;
}

export type TransacaoDoResumo = Pick<Transacao, 'tipo' | 'valor' | 'taxa' | 'multa' | 'lucro' | 'variacaoCaixa'>;

// RN17: totais das transações filtradas, somados em centavos (DEC-037); a taxa soma a da compra e a comissão da venda
export function resumirHistorico(transacoes: TransacaoDoResumo[]): ResumoDoHistorico {
  const resumo: ResumoDoHistorico = { totalGasto: 0, totalRecebido: 0, totalTaxas: 0, totalMultas: 0, totalLucro: 0 };
  for (const transacao of transacoes) {
    resumo.totalTaxas += transacao.taxa;
    if (transacao.tipo === 'COMPRA') {
      resumo.totalGasto += transacao.valor + transacao.taxa;
    } else {
      resumo.totalRecebido += transacao.variacaoCaixa;
      resumo.totalMultas += transacao.multa;
      resumo.totalLucro += transacao.lucro ?? 0;
    }
  }
  return resumo;
}
