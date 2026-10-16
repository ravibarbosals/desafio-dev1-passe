import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { IdDaUrlPipe } from '@/core/http/id-da-url.pipe';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { criarJogadorResposta, JogadorRespostaDto } from '@/modulos/jogadores/dto/jogador-resposta.dto';
import { CODIGO_JOGADOR_NAO_ENCONTRADO, JogadoresService, MENSAGEM_JOGADOR_NAO_ENCONTRADO } from '@/modulos/jogadores/services/jogadores.service';

const idDoJogador = new IdDaUrlPipe(CODIGO_JOGADOR_NAO_ENCONTRADO, MENSAGEM_JOGADOR_NAO_ENCONTRADO);

@ApiTags('Jogadores')
@Controller('players')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  @ApiCreatedResponse({ type: JogadorRespostaDto, description: 'Jogador criado, livre e APTO', headers: { Location: { description: '/api/v1/players/{id}' } } })
  @ApiBadRequestResponse({ description: 'Corpo fora do formato ou dos limites (V1 a V6)' })
  async cadastrar(@Body() dados: CriarJogadorDto, @Res({ passthrough: true }) resposta: Response): Promise<JogadorRespostaDto> {
    const jogador = await this.jogadoresService.cadastrar(dados);
    resposta.location(`/api/v1/players/${jogador.id}`);
    return criarJogadorResposta(jogador);
  }

  @Get(':id')
  @ApiOkResponse({ type: JogadorRespostaDto })
  @ApiNotFoundResponse({ description: 'Id inexistente, fora do formato ou de jogador excluído' })
  async consultar(@Param('id', idDoJogador) id: number): Promise<JogadorRespostaDto> {
    return criarJogadorResposta(await this.jogadoresService.consultar(id));
  }
}
