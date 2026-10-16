import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ClubeRespostaDto, criarClubeResposta } from '@/modulos/clubes/dto/clube-resposta.dto';
import { CriarClubeDto } from '@/modulos/clubes/dto/criar-clube.dto';
import { ClubesService } from '@/modulos/clubes/services/clubes.service';

@ApiTags('Clubes')
@Controller('clubs')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

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
}
