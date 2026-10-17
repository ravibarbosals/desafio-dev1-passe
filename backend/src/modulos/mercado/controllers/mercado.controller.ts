import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RECURSOS_NAO_ENCONTRADOS } from '@/core/erros/nao-encontrado';
import { IdDaUrlPipe } from '@/core/http/id-da-url.pipe';
import { CompraRespostaDto, criarCompraResposta } from '@/modulos/mercado/dto/compra-resposta.dto';
import { ComprarJogadorDto } from '@/modulos/mercado/dto/comprar-jogador.dto';
import { HistoricoQueryDto } from '@/modulos/mercado/dto/historico-query.dto';
import { criarHistoricoResposta, HistoricoRespostaDto } from '@/modulos/mercado/dto/historico-resposta.dto';
import { criarVendaResposta, VendaRespostaDto } from '@/modulos/mercado/dto/venda-resposta.dto';
import { MercadoService } from '@/modulos/mercado/services/mercado.service';

const idDoJogador = new IdDaUrlPipe(RECURSOS_NAO_ENCONTRADOS.jogador.codigo, RECURSOS_NAO_ENCONTRADOS.jogador.mensagem);
const idDoClube = new IdDaUrlPipe(RECURSOS_NAO_ENCONTRADOS.clube.codigo, RECURSOS_NAO_ENCONTRADOS.clube.mensagem);

@ApiTags('Mercado')
@Controller()
export class MercadoController {
  constructor(private readonly mercadoService: MercadoService) {}

  // E 2.3.1: a compra responde 200, e não 201
  @Post('players/:id/buy')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CompraRespostaDto })
  @ApiBadRequestResponse({ description: 'Corpo fora do formato (DADOS_INVALIDOS) ou fidelidade fora do prazo (FIDELIDADE_FORA_DO_PRAZO)' })
  @ApiNotFoundResponse({ description: 'Jogador (URL) ou clube (club_id) inexistente' })
  @ApiConflictResponse({ description: 'JOGADOR_NAO_ESTA_LIVRE, RECOMPRA_PELO_CLUBE_VENDEDOR, ELENCO_CHEIO ou CUSTO_ACIMA_DO_LIMITE_DE_CAIXA' })
  async comprar(@Param('id', idDoJogador) id: number, @Body() dados: ComprarJogadorDto): Promise<CompraRespostaDto> {
    return criarCompraResposta(await this.mercadoService.comprar(id, dados));
  }

  // E 2.3.2: sem corpo; um corpo enviado é ignorado (AM-005, corpo-json.middleware)
  @Post('players/:id/sell')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VendaRespostaDto })
  @ApiNotFoundResponse({ description: 'Id inexistente, fora do formato ou de jogador excluído' })
  @ApiConflictResponse({ description: 'Jogador livre (JOGADOR_LIVRE_NAO_PODE_SER_VENDIDO)' })
  async vender(@Param('id', idDoJogador) id: number): Promise<VendaRespostaDto> {
    return criarVendaResposta(await this.mercadoService.vender(id));
  }

  @Get('clubs/:id/transactions')
  @ApiOkResponse({ type: HistoricoRespostaDto })
  @ApiBadRequestResponse({ description: 'type ou player_id fora do formato' })
  @ApiNotFoundResponse({ description: 'Clube inexistente, ou jogador do filtro inexistente ou excluído' })
  async consultarHistorico(@Param('id', idDoClube) id: number, @Query() filtros: HistoricoQueryDto): Promise<HistoricoRespostaDto> {
    return criarHistoricoResposta(await this.mercadoService.consultarHistorico(id, filtros));
  }
}
