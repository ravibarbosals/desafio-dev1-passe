import { ApiProperty } from '@nestjs/swagger';
import { formatarDataHora } from '@/core/comum/data-hora/data-hora';
import { centavosParaNumero } from '@/core/comum/moeda/moeda';
import { criarTransacaoResposta, TransacaoRespostaDto } from '@/modulos/mercado/dto/transacao-resposta.dto';
import { SITUACOES_CONTRATO } from '@/modulos/mercado/entities/contrato.entity';
import type { SituacaoContrato } from '@/modulos/mercado/entities/contrato.entity';
import type { Compra } from '@/modulos/mercado/services/mercado.service';

export class ContratoDaCompraRespostaDto {
  @ApiProperty({ example: 37.0 })
  purchase_value!: number;

  @ApiProperty({ example: '2027-03-02T10:15:00-03:00' })
  loyalty_until!: string;

  @ApiProperty({ enum: SITUACOES_CONTRATO, example: 'ATIVO' })
  status!: SituacaoContrato;
}

// Exemplo 2.3.1 do enunciado: a transação COMPRA + o contrato criado + o caixa do clube depois da compra
export class CompraRespostaDto extends TransacaoRespostaDto {
  @ApiProperty({ type: ContratoDaCompraRespostaDto })
  contract!: ContratoDaCompraRespostaDto;

  @ApiProperty({ example: 261.15 })
  club_cash!: number;
}

export function criarCompraResposta({ transacao, contrato, caixaDoClube }: Compra): CompraRespostaDto {
  return Object.assign(criarTransacaoResposta(transacao), {
    contract: { purchase_value: centavosParaNumero(contrato.valorCompra), loyalty_until: formatarDataHora(contrato.fidelidadeAte), status: contrato.situacao },
    club_cash: centavosParaNumero(caixaDoClube),
  });
}
