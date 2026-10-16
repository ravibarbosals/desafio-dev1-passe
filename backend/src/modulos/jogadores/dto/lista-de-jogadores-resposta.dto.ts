import { ApiProperty } from '@nestjs/swagger';
import type { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { criarJogadorResposta, JogadorRespostaDto } from '@/modulos/jogadores/dto/jogador-resposta.dto';
import type { Pagina } from '@/modulos/jogadores/helpers/paginacao';

export class MetaDaPaginaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 23, description: 'Todos os jogadores que atendem à busca e aos filtros' })
  total_items!: number;

  @ApiProperty({ example: 3, description: '0 quando não há itens' })
  total_pages!: number;
}

// RN07: objeto paginado com data e meta
export class ListaDeJogadoresRespostaDto {
  @ApiProperty({ type: [JogadorRespostaDto] })
  data!: JogadorRespostaDto[];

  @ApiProperty({ type: MetaDaPaginaDto })
  meta!: MetaDaPaginaDto;
}

export function criarListaDeJogadoresResposta(pagina: Pagina<Jogador>): ListaDeJogadoresRespostaDto {
  return {
    data: pagina.itens.map(criarJogadorResposta),
    meta: { page: pagina.pagina, limit: pagina.limite, total_items: pagina.totalDeItens, total_pages: pagina.totalDePaginas },
  };
}
