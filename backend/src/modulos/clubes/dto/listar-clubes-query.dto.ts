import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ValorDeQuery } from '@/core/validacao/query/query.decorators';
import { ORDENACOES_DE_CLUBES } from '@/modulos/clubes/helpers/ordenacao-de-clubes';
import type { OrdenacaoDeClubes } from '@/modulos/clubes/helpers/ordenacao-de-clubes';

// "Filtros e query params aceitos" de GET /clubs: um só valor, com as maiúsculas e minúsculas exatas (V5)
export class ListarClubesQueryDto {
  @ApiPropertyOptional({ enum: ORDENACOES_DE_CLUBES, default: 'name' })
  @IsOptional()
  @ValorDeQuery(ORDENACOES_DE_CLUBES)
  sort?: OrdenacaoDeClubes;
}
