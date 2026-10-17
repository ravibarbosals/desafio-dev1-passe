import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { InteiroDeQuery } from '@/core/validacao/query/query.decorators';

// RN21: filtro do histórico de partidas; ausente não filtra, vazio ou fora do formato → 400
export class ListarPartidasQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Partidas em que o clube foi mandante ou visitante; clube inexistente → 404' })
  @IsOptional()
  @InteiroDeQuery(1)
  club_id?: number;
}
