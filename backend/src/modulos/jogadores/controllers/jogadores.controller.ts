import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { RECURSOS_NAO_ENCONTRADOS } from '@/core/erros/nao-encontrado';
import { IdDaUrlPipe } from '@/core/http/id-da-url.pipe';
import { AlterarCondicaoDto } from '@/modulos/jogadores/dto/alterar-condicao.dto';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { EditarJogadorDto } from '@/modulos/jogadores/dto/editar-jogador.dto';
import { criarJogadorResposta, JogadorRespostaDto } from '@/modulos/jogadores/dto/jogador-resposta.dto';
import { criarListaDeJogadoresResposta, ListaDeJogadoresRespostaDto } from '@/modulos/jogadores/dto/lista-de-jogadores-resposta.dto';
import { ListarJogadoresQueryDto } from '@/modulos/jogadores/dto/listar-jogadores-query.dto';
import { JogadoresService } from '@/modulos/jogadores/services/jogadores.service';

const idDoJogador = new IdDaUrlPipe(RECURSOS_NAO_ENCONTRADOS.jogador.codigo, RECURSOS_NAO_ENCONTRADOS.jogador.mensagem);

@ApiTags('Jogadores')
@Controller('players')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Get()
  @ApiOkResponse({ type: ListaDeJogadoresRespostaDto })
  @ApiBadRequestResponse({ description: 'Parâmetro fora do formato ou combinação contraditória' })
  @ApiNotFoundResponse({ description: 'club_id de clube inexistente' })
  async listar(@Query() filtros: ListarJogadoresQueryDto): Promise<ListaDeJogadoresRespostaDto> {
    return criarListaDeJogadoresResposta(await this.jogadoresService.listar(filtros));
  }

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

  @Put(':id')
  @ApiOkResponse({ type: JogadorRespostaDto })
  @ApiBadRequestResponse({ description: 'Corpo fora do formato ou dos limites; os quatro campos são obrigatórios' })
  @ApiNotFoundResponse({ description: 'Id inexistente, fora do formato ou de jogador excluído' })
  @ApiConflictResponse({ description: 'Posição diferente em jogador com clube (POSICAO_BLOQUEADA_COM_CLUBE) ou idade menor que a atual (IDADE_NAO_PODE_DIMINUIR)' })
  async editar(@Param('id', idDoJogador) id: number, @Body() dados: EditarJogadorDto): Promise<JogadorRespostaDto> {
    return criarJogadorResposta(await this.jogadoresService.editar(id, dados));
  }

  @Patch(':id/condition')
  @ApiOkResponse({ type: JogadorRespostaDto })
  @ApiBadRequestResponse({ description: 'condition ausente ou fora da lista' })
  @ApiNotFoundResponse({ description: 'Id inexistente, fora do formato ou de jogador excluído' })
  @ApiConflictResponse({ description: 'De DOENTE direto para APTO (DOENTE_NAO_VAI_DIRETO_PARA_APTO)' })
  async alterarCondicao(@Param('id', idDoJogador) id: number, @Body() dados: AlterarCondicaoDto): Promise<JogadorRespostaDto> {
    return criarJogadorResposta(await this.jogadoresService.alterarCondicao(id, dados));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Jogador excluído (exclusão lógica)' })
  @ApiNotFoundResponse({ description: 'Id inexistente, fora do formato ou de jogador já excluído' })
  @ApiConflictResponse({ description: 'Jogador com clube (JOGADOR_COM_CLUBE_NAO_PODE_SER_EXCLUIDO)' })
  async excluir(@Param('id', idDoJogador) id: number): Promise<void> {
    await this.jogadoresService.excluir(id);
  }
}
