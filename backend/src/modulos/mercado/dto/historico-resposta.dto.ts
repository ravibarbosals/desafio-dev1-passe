import { ApiProperty } from '@nestjs/swagger';
import { centavosParaNumero } from '@/core/comum/moeda/moeda';
import { criarTransacaoResposta, TransacaoRespostaDto } from '@/modulos/mercado/dto/transacao-resposta.dto';
import type { Historico } from '@/modulos/mercado/services/mercado.service';

// RN17: totais só das transações filtradas
export class ResumoDoHistoricoRespostaDto {
  @ApiProperty({ example: 38.85, description: 'Σ (valor + taxa) das COMPRA' })
  total_spent!: number;

  @ApiProperty({ example: 35.7, description: 'Σ crédito das VENDA' })
  total_received!: number;

  @ApiProperty({ example: 2.15, description: 'Σ taxas de compra e comissões de venda' })
  total_fees!: number;

  @ApiProperty({ example: 4.0, description: 'Σ multas das VENDA' })
  total_penalties!: number;

  @ApiProperty({ example: 3.0, description: 'Σ lucro das VENDA, com sinal' })
  total_profit!: number;
}

// Exemplo 2.3.3 do enunciado: da transação mais recente para a mais antiga
export class HistoricoRespostaDto {
  @ApiProperty({ type: [TransacaoRespostaDto] })
  data!: TransacaoRespostaDto[];

  @ApiProperty({ type: ResumoDoHistoricoRespostaDto })
  summary!: ResumoDoHistoricoRespostaDto;
}

export function criarHistoricoResposta({ transacoes, resumo }: Historico): HistoricoRespostaDto {
  return {
    data: transacoes.map(criarTransacaoResposta),
    summary: {
      total_spent: centavosParaNumero(resumo.totalGasto),
      total_received: centavosParaNumero(resumo.totalRecebido),
      total_fees: centavosParaNumero(resumo.totalTaxas),
      total_penalties: centavosParaNumero(resumo.totalMultas),
      total_profit: centavosParaNumero(resumo.totalLucro),
    },
  };
}
