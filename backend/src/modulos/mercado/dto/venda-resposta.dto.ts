import { ApiProperty } from '@nestjs/swagger';
import { centavosParaNumero } from '@/core/comum/moeda/moeda';
import { criarTransacaoResposta, TransacaoRespostaDto } from '@/modulos/mercado/dto/transacao-resposta.dto';
import { SITUACOES_CONTRATO } from '@/modulos/mercado/entities/contrato.entity';
import type { SituacaoContrato } from '@/modulos/mercado/entities/contrato.entity';
import type { Venda } from '@/modulos/mercado/services/mercado.service';

// Exemplo 2.3.2 do enunciado: a transação VENDA + os dados do contrato encerrado + o caixa do clube depois da venda
export class VendaRespostaDto extends TransacaoRespostaDto {
  @ApiProperty({ example: 37.0, description: 'Valor pago na compra, sem a taxa (RN16)' })
  purchase_value!: number;

  @ApiProperty({ example: 117, description: 'Dias que faltavam da fidelidade, arredondados para cima (RN15)' })
  remaining_days!: number;

  @ApiProperty({ example: 10, description: 'Percentual da multa: 0, 5, 10 ou 20 (RN15)' })
  penalty_rate!: number;

  @ApiProperty({ enum: SITUACOES_CONTRATO, example: 'RESCINDIDO', description: 'RESCINDIDO com multa, ENCERRADO sem multa' })
  contract_status!: SituacaoContrato;

  @ApiProperty({ example: 296.85 })
  club_cash!: number;
}

export function criarVendaResposta({ transacao, contrato, caixaDoClube, diasRestantes, percentualDeMulta }: Venda): VendaRespostaDto {
  return Object.assign(criarTransacaoResposta(transacao), {
    purchase_value: centavosParaNumero(contrato.valorCompra),
    remaining_days: diasRestantes,
    penalty_rate: percentualDeMulta,
    contract_status: contrato.situacao,
    club_cash: centavosParaNumero(caixaDoClube),
  });
}
