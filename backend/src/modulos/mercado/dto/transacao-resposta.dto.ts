import { ApiProperty } from '@nestjs/swagger';
import { formatarDataHora } from '@/core/comum/data-hora/data-hora';
import { centavosParaNumero } from '@/core/comum/moeda/moeda';
import { TIPOS_TRANSACAO } from '@/modulos/mercado/entities/transacao.entity';
import type { TipoTransacao, Transacao } from '@/modulos/mercado/entities/transacao.entity';

// Contrato da transação (E 2.3): valores e nome do momento da operação, nunca recalculados (RN17)
export class TransacaoRespostaDto {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 1 })
  club_id!: number;

  @ApiProperty({ example: 2 })
  player_id!: number;

  @ApiProperty({ example: 'Meia Lua', description: 'Nome no momento da operação' })
  player_name!: string;

  @ApiProperty({ enum: TIPOS_TRANSACAO, example: 'COMPRA' })
  type!: TipoTransacao;

  @ApiProperty({ example: 37.0, description: 'Valor de mercado no momento da operação' })
  value!: number;

  @ApiProperty({ example: 1.85, description: 'Taxa de compra (RN13) ou comissão de venda (RN16)' })
  fee!: number;

  @ApiProperty({ example: 0.0, description: 'Multa por fidelidade (RN15); 0 na compra' })
  penalty!: number;

  @ApiProperty({ type: Number, nullable: true, example: null, description: 'Lucro da venda, com sinal; null na compra' })
  profit!: number | null;

  @ApiProperty({ example: -38.85, description: 'Variação do caixa, com sinal' })
  cash_change!: number;

  @ApiProperty({ example: '2026-11-02T10:15:00-03:00' })
  created_at!: string;
}

export function criarTransacaoResposta(transacao: Transacao): TransacaoRespostaDto {
  return {
    id: transacao.id,
    club_id: transacao.clubeId,
    player_id: transacao.jogadorId,
    player_name: transacao.nomeJogador,
    type: transacao.tipo,
    value: centavosParaNumero(transacao.valor),
    fee: centavosParaNumero(transacao.taxa),
    penalty: centavosParaNumero(transacao.multa),
    profit: transacao.lucro === null ? null : centavosParaNumero(transacao.lucro),
    cash_change: centavosParaNumero(transacao.variacaoCaixa),
    created_at: formatarDataHora(transacao.criadoEm),
  };
}
