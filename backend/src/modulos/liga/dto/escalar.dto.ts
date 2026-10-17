import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ListaDeIds } from '@/core/validacao/numero/lista-de-ids.decorator';
import { FORMACOES } from '@/modulos/liga/helpers/formacao';
import type { Formacao } from '@/modulos/liga/helpers/formacao';

// Formato aqui (400 DADOS_INVALIDOS); existência (404), elenco, condição e posições (409) ficam no service (RN19)
export class EscalarDto {
  @ApiProperty({ enum: FORMACOES, example: '2-1-1' })
  @IsIn(FORMACOES, { message: `$property deve ser um destes valores: ${FORMACOES.join(', ')}.` })
  formation!: Formacao;

  @ApiProperty({ type: [Number], example: [34, 31, 30, 33, 32], description: 'Os 5 titulares, em qualquer ordem' })
  @ListaDeIds(5)
  player_ids!: number[];
}
