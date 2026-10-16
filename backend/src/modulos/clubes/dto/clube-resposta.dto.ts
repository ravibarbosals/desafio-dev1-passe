import { ApiProperty } from '@nestjs/swagger';
import { centavosParaNumero } from '@/core/comum/moeda/moeda';
import type { Clube } from '@/modulos/clubes/entities/clube.entity';

// Formato do exemplo de criação do enunciado; squad_value e net_worth são calculados, nunca gravados (RN11)
export class ClubeRespostaDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Águias FC' })
  name!: string;

  @ApiProperty({ example: 'AGU' })
  acronym!: string;

  @ApiProperty({ example: 300.0 })
  cash!: number;

  @ApiProperty({ example: 0.0, description: 'Soma do valor de mercado do elenco' })
  squad_value!: number;

  @ApiProperty({ example: 300.0, description: 'cash + squad_value' })
  net_worth!: number;
}

export function criarClubeResposta(clube: Clube, valorDoElencoCentavos: number): ClubeRespostaDto {
  return {
    id: clube.id,
    name: clube.nome,
    acronym: clube.sigla,
    cash: centavosParaNumero(clube.caixa),
    squad_value: centavosParaNumero(valorDoElencoCentavos),
    net_worth: centavosParaNumero(clube.caixa + valorDoElencoCentavos),
  };
}