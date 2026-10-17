import { ApiProperty } from '@nestjs/swagger';
import { criarJogadorResposta, JogadorRespostaDto } from '@/modulos/jogadores/dto/jogador-resposta.dto';
import { FORMACOES } from '@/modulos/liga/helpers/formacao';
import type { EscalacaoDoClube } from '@/modulos/liga/services/liga.service';

// RN19.6 e E 2.4.1: a mesma resposta no PUT e no GET
export class EscalacaoRespostaDto {
  @ApiProperty({ example: 1 })
  club_id!: number;

  @ApiProperty({ enum: FORMACOES, nullable: true, example: '2-1-1', description: 'null = nunca escalou; continua a salva quando um titular sai (RN19.5)' })
  formation!: string | null;

  @ApiProperty({ example: true, description: 'true com os 5 titulares' })
  complete!: boolean;

  @ApiProperty({ type: [JogadorRespostaDto], description: 'Titulares na ordem do elenco (RN11)' })
  players!: JogadorRespostaDto[];
}

export function criarEscalacaoResposta({ clube, titulares }: EscalacaoDoClube): EscalacaoRespostaDto {
  return {
    club_id: clube.id,
    formation: clube.formacao,
    complete: titulares.length === 5,
    players: titulares.map(criarJogadorResposta),
  };
}
