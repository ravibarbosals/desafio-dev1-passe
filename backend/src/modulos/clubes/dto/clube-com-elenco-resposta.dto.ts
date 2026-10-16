import { ApiProperty } from '@nestjs/swagger';
import { formatarDataHora } from '@/core/comum/data-hora/data-hora';
import { centavosParaNumero } from '@/core/comum/moeda/moeda';
import { ClubeRespostaDto, criarClubeResposta } from '@/modulos/clubes/dto/clube-resposta.dto';
import type { ClubeComElenco, JogadorComContrato } from '@/modulos/clubes/services/clubes.service';
import { criarJogadorResposta, JogadorRespostaDto } from '@/modulos/jogadores/dto/jogador-resposta.dto';

export class ContratoDoElencoRespostaDto {
  @ApiProperty({ example: 37.0, description: 'Valor de mercado pago na compra, sem a taxa' })
  purchase_value!: number;

  @ApiProperty({ example: '2027-03-02T10:15:00-03:00' })
  loyalty_until!: string;

  @ApiProperty({ example: 120, description: 'Dias até o fim da fidelidade, para uma venda agora (RN15)' })
  remaining_days!: number;

  @ApiProperty({ example: 10, description: 'Percentual da multa para uma venda agora (RN15)' })
  penalty_rate!: number;
}

export class JogadorDoElencoRespostaDto extends JogadorRespostaDto {
  @ApiProperty({ type: ContratoDoElencoRespostaDto })
  contract!: ContratoDoElencoRespostaDto;
}

// Formato do exemplo 2.2.2 do enunciado
export class ClubeComElencoRespostaDto extends ClubeRespostaDto {
  @ApiProperty({ type: [JogadorDoElencoRespostaDto] })
  players!: JogadorDoElencoRespostaDto[];
}

function criarJogadorDoElencoResposta({ jogador, contrato, diasRestantes, percentualDeMulta }: JogadorComContrato): JogadorDoElencoRespostaDto {
  const contract = {
    purchase_value: centavosParaNumero(contrato.valorCompra),
    loyalty_until: formatarDataHora(contrato.fidelidadeAte),
    remaining_days: diasRestantes,
    penalty_rate: percentualDeMulta,
  };
  return Object.assign(criarJogadorResposta(jogador), { contract });
}

export function criarClubeComElencoResposta({ clube, valorDoElenco, elenco }: ClubeComElenco): ClubeComElencoRespostaDto {
  return Object.assign(criarClubeResposta(clube, valorDoElenco), { players: elenco.map(criarJogadorDoElencoResposta) });
}
