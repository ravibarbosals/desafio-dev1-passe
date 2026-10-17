import { ApiProperty } from '@nestjs/swagger';
import type { LinhaDaClassificacao } from '@/modulos/liga/helpers/classificacao';

// E 2.4.3: uma linha por clube, inclusive os que não jogaram (zerados)
export class LinhaDaClassificacaoRespostaDto {
  @ApiProperty({ example: 1, description: '1 a N, sem repetir (RN21.4)' })
  position!: number;

  @ApiProperty({ example: 2 })
  club_id!: number;

  @ApiProperty({ example: 'Delta FC' })
  club_name!: string;

  @ApiProperty({ example: 1 })
  played!: number;

  @ApiProperty({ example: 1 })
  wins!: number;

  @ApiProperty({ example: 0 })
  draws!: number;

  @ApiProperty({ example: 0 })
  losses!: number;

  @ApiProperty({ example: 2 })
  goals_for!: number;

  @ApiProperty({ example: 1 })
  goals_against!: number;

  @ApiProperty({ example: 1 })
  goal_difference!: number;

  @ApiProperty({ example: 3, description: 'Vitória 3, empate 1, derrota 0' })
  points!: number;
}

export function criarLinhaDaClassificacaoResposta(linha: LinhaDaClassificacao): LinhaDaClassificacaoRespostaDto {
  return {
    position: linha.posicao,
    club_id: linha.clubeId,
    club_name: linha.nomeClube,
    played: linha.jogos,
    wins: linha.vitorias,
    draws: linha.empates,
    losses: linha.derrotas,
    goals_for: linha.golsPro,
    goals_against: linha.golsContra,
    goal_difference: linha.saldo,
    points: linha.pontos,
  };
}
