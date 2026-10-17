import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { InteiroDeQuery, ListaDeQuery } from '@/core/validacao/query/query.decorators';
import { TIPOS_TRANSACAO } from '@/modulos/mercado/entities/transacao.entity';
import type { TipoTransacao } from '@/modulos/mercado/entities/transacao.entity';

// RN17: filtros do histórico e da exportação; ausente não filtra, vazio, repetido ou fora do formato → 400
export class HistoricoQueryDto {
  @ApiPropertyOptional({ type: String, example: 'COMPRA,VENDA', description: 'Um ou mais de COMPRA, VENDA, separados por vírgula, sem espaço e sem repetir' })
  @IsOptional()
  @ListaDeQuery(TIPOS_TRANSACAO)
  type?: TipoTransacao[];

  @ApiPropertyOptional({ example: 2, description: 'Jogador inexistente ou excluído → 404; de outro clube → lista vazia' })
  @IsOptional()
  @InteiroDeQuery(1)
  player_id?: number;
}
