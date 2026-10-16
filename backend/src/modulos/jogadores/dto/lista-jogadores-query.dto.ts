import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { MenorOuIgualA, ProibidoJuntoCom } from '@/core/validacao/comparacao/comparacao.decorators';
import { BooleanoDeQuery, DecimalDeQuery, InteiroDeQuery, ListaDeQuery, ValorDeQuery } from '@/core/validacao/query/query.decorators';
import { TextoV4 } from '@/core/validacao/texto/texto-v4.decorator';
import { CONDICOES_JOGADOR, POSICOES_JOGADOR } from '@/modulos/jogadores/entities/jogador.entity';
import type { CondicaoJogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { ORDENACOES_DA_LISTAGEM } from '@/modulos/jogadores/helpers/ordenacao-da-listagem';
import type { OrdenacaoDaListagem } from '@/modulos/jogadores/helpers/ordenacao-da-listagem';

// "Filtros e query params aceitos" de GET /players; ausente não filtra, vazio ou fora do formato → 400
export class ListarJogadoresQueryDto {
  @ApiPropertyOptional({ description: 'Parte do nome, sem diferenciar maiúsculas, minúsculas e acentos (2 a 100 caracteres)', example: 'lua' })
  @IsOptional()
  @TextoV4(2, 100)
  search?: string;

  @ApiPropertyOptional({ enum: POSICOES_JOGADOR })
  @IsOptional()
  @ValorDeQuery(POSICOES_JOGADOR)
  position?: PosicaoJogador;

  @ApiPropertyOptional({ enum: CONDICOES_JOGADOR })
  @IsOptional()
  @ValorDeQuery(CONDICOES_JOGADOR)
  condition?: CondicaoJogador;

  @ApiPropertyOptional({ enum: ['true', 'false'], description: 'true: só livres; false: só com clube. true com club_id → 400' })
  @IsOptional()
  @BooleanoDeQuery()
  @ProibidoJuntoCom('club_id', (valor) => valor === true)
  free?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Clube inexistente → 404' })
  @IsOptional()
  @InteiroDeQuery(1)
  club_id?: number;

  @ApiPropertyOptional({ minimum: 16, maximum: 45 })
  @IsOptional()
  @InteiroDeQuery(16, 45)
  @MenorOuIgualA('max_age')
  min_age?: number;

  @ApiPropertyOptional({ minimum: 16, maximum: 45 })
  @IsOptional()
  @InteiroDeQuery(16, 45)
  max_age?: number;

  // Em centavos depois da validação (DEC-037)
  @ApiPropertyOptional({ type: String, example: '10.5', description: 'Valor de mercado mínimo, de 0 a 550, até 2 casas' })
  @IsOptional()
  @DecimalDeQuery(0, 550)
  @MenorOuIgualA('max_value')
  min_value?: number;

  @ApiPropertyOptional({ type: String, example: '40', description: 'Valor de mercado máximo, de 0 a 550, até 2 casas' })
  @IsOptional()
  @DecimalDeQuery(0, 550)
  max_value?: number;

  @ApiPropertyOptional({ type: String, example: 'value_desc,name', description: `Até dois de ${ORDENACOES_DA_LISTAGEM.join(', ')}, sem repetir o campo; padrão name` })
  @IsOptional()
  @ListaDeQuery(ORDENACOES_DA_LISTAGEM, { maximo: 2, campo: (valor) => valor.replace(/_(asc|desc)$/, '') })
  sort?: OrdenacaoDaListagem[];

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @InteiroDeQuery(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @InteiroDeQuery(1, 50)
  limit?: number;
}