import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CONDICOES_JOGADOR } from '@/modulos/jogadores/entities/jogador.entity';
import type { CondicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

export class AlterarCondicaoDto {
  @ApiProperty({ enum: CONDICOES_JOGADOR, example: 'MAL_CONDICIONADO', description: 'DOENTE não volta direto para APTO' })
  @IsIn(CONDICOES_JOGADOR, { message: `$property deve ser um destes valores: ${CONDICOES_JOGADOR.join(', ')}.` })
  condition!: CondicaoJogador;
}
