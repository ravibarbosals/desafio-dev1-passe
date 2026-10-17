import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { RECURSOS_NAO_ENCONTRADOS } from '@/core/erros/nao-encontrado';
import { IdDaUrlPipe } from '@/core/http/id-da-url.pipe';
import { ClubeComElencoRespostaDto, criarClubeComElencoResposta } from '@/modulos/clubes/dto/clube-com-elenco-resposta.dto';
import { ClubeRespostaDto, criarClubeResposta } from '@/modulos/clubes/dto/clube-resposta.dto';
import { CriarClubeDto } from '@/modulos/clubes/dto/criar-clube.dto';
import { ListarClubesQueryDto } from '@/modulos/clubes/dto/listar-clubes-query.dto';
import { ClubesService } from '@/modulos/clubes/services/clubes.service';

const idDoClube = new IdDaUrlPipe(RECURSOS_NAO_ENCONTRADOS.clube.codigo, RECURSOS_NAO_ENCONTRADOS.clube.mensagem);
@ApiTags('Clubes')
@Controller('clubs')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Get()
  @ApiOkResponse({ type: [ClubeRespostaDto] })
  @ApiBadRequestResponse({ description: 'sort fora da lista ou com mais de um valor' })
  async listar(@Query() filtros: ListarClubesQueryDto): Promise<ClubeRespostaDto[]> {
    const clubes = await this.clubesService.listar(filtros);
    return clubes.map(({ clube, valorDoElenco }) => criarClubeResposta(clube, valorDoElenco));
  }

  // Clube novo não tem elenco: squad_value 0,00
  @Post()
  @ApiCreatedResponse({ type: ClubeRespostaDto, description: 'Clube criado com 300,00 de caixa', headers: { Location: { description: '/api/v1/clubs/{id}' } } })
  @ApiBadRequestResponse({ description: 'Nome ou sigla fora dos limites' })
  @ApiConflictResponse({ description: 'Nome ou sigla já usados (NOME_DE_CLUBE_JA_CADASTRADO, SIGLA_JA_CADASTRADA) ou 20 clubes (LIMITE_DE_CLUBES_ATINGIDO)' })
  async criar(@Body() dados: CriarClubeDto, @Res({ passthrough: true }) resposta: Response): Promise<ClubeRespostaDto> {
    const clube = await this.clubesService.criar(dados);
    resposta.location(`/api/v1/clubs/${clube.id}`);
    return criarClubeResposta(clube, 0);
  }

  @Get(':id')
  @ApiOkResponse({ type: ClubeComElencoRespostaDto })
  @ApiNotFoundResponse({ description: 'Id inexistente ou fora do formato' })
  async consultar(@Param('id', idDoClube) id: number): Promise<ClubeComElencoRespostaDto> {
    return criarClubeComElencoResposta(await this.clubesService.consultar(id));
  }
}
