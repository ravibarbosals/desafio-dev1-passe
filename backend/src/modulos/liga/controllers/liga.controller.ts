import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { RECURSOS_NAO_ENCONTRADOS } from '@/core/erros/nao-encontrado';
import { IdDaUrlPipe } from '@/core/http/id-da-url.pipe';
import { criarEscalacaoResposta, EscalacaoRespostaDto } from '@/modulos/liga/dto/escalacao-resposta.dto';
import { EscalarDto } from '@/modulos/liga/dto/escalar.dto';
import { JogarPartidaDto } from '@/modulos/liga/dto/jogar-partida.dto';
import { criarPartidaResposta, PartidaRespostaDto } from '@/modulos/liga/dto/partida-resposta.dto';
import { LigaService } from '@/modulos/liga/services/liga.service';

const idDoClube = new IdDaUrlPipe(RECURSOS_NAO_ENCONTRADOS.clube.codigo, RECURSOS_NAO_ENCONTRADOS.clube.mensagem);

@ApiTags('Liga')
@Controller()
export class LigaController {
  constructor(private readonly ligaService: LigaService) {}

  @Put('clubs/:id/lineup')
  @ApiOkResponse({ type: EscalacaoRespostaDto })
  @ApiBadRequestResponse({ description: 'formation fora da lista ou player_ids sem 5 ids distintos' })
  @ApiNotFoundResponse({ description: 'Clube inexistente, ou jogador inexistente ou excluído' })
  @ApiConflictResponse({ description: 'JOGADOR_FORA_DO_ELENCO, JOGADOR_DOENTE_NAO_PODE_SER_ESCALADO ou POSICOES_NAO_FECHAM_A_FORMACAO' })
  async escalar(@Param('id', idDoClube) id: number, @Body() dados: EscalarDto): Promise<EscalacaoRespostaDto> {
    return criarEscalacaoResposta(await this.ligaService.escalar(id, dados));
  }

  @Get('clubs/:id/lineup')
  @ApiOkResponse({ type: EscalacaoRespostaDto })
  @ApiNotFoundResponse({ description: 'Clube inexistente' })
  async consultarEscalacao(@Param('id', idDoClube) id: number): Promise<EscalacaoRespostaDto> {
    return criarEscalacaoResposta(await this.ligaService.consultarEscalacao(id));
  }

  @Post('matches')
  @ApiCreatedResponse({ type: PartidaRespostaDto, description: 'Partida jogada e gravada, com os 6 duelos', headers: { Location: { description: '/api/v1/matches/{id}' } } })
  @ApiBadRequestResponse({ description: 'Id fora do formato ou mandante igual ao visitante' })
  @ApiNotFoundResponse({ description: 'Mandante ou visitante inexistente' })
  @ApiConflictResponse({ description: 'ESCALACAO_INCOMPLETA' })
  async jogar(@Body() dados: JogarPartidaDto, @Res({ passthrough: true }) resposta: Response): Promise<PartidaRespostaDto> {
    const partida = await this.ligaService.jogar(dados);
    resposta.location(`/api/v1/matches/${partida.id}`);
    return criarPartidaResposta(partida);
  }
}
