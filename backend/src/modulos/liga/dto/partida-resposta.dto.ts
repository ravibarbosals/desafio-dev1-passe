import { ApiProperty } from '@nestjs/swagger';
import { formatarDataHora } from '@/core/comum/data-hora/data-hora';
import { CONDICOES_JOGADOR, POSICOES_JOGADOR } from '@/modulos/jogadores/entities/jogador.entity';
import type { CondicaoJogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import type { Clube } from '@/modulos/clubes/entities/clube.entity';
import type { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';
import type { Partida } from '@/modulos/liga/entities/partida.entity';
import { calcularResultado } from '@/modulos/liga/helpers/partida';
import type { ResultadoDaPartida } from '@/modulos/liga/helpers/partida';

export class LadoDaPartidaRespostaDto {
  @ApiProperty({ example: 1 })
  club_id!: number;

  @ApiProperty({ example: 'Águias FC' })
  club_name!: string;

  @ApiProperty({ example: '2-1-1', description: 'Formação no momento da partida' })
  formation!: string;

  @ApiProperty({ example: 1 })
  goals!: number;
}

export class JogadorDoDueloRespostaDto {
  @ApiProperty({ example: 34 })
  player_id!: number;

  @ApiProperty({ example: 'Otto Rangel', description: 'Nome no momento da partida' })
  player_name!: string;

  @ApiProperty({ enum: POSICOES_JOGADOR, example: 'ATA' })
  position!: PosicaoJogador;

  @ApiProperty({ enum: CONDICOES_JOGADOR, example: 'APTO' })
  condition!: CondicaoJogador;

  @ApiProperty({ example: 'shooting', description: 'shooting, passing ou dribbling no ataque; sempre defending na defesa' })
  attribute!: string;

  @ApiProperty({ example: 75, description: 'Já com o efeito da condição (RN20.3)' })
  value!: number;
}

export class DueloRespostaDto {
  @ApiProperty({ example: 1, description: '1 a 3: ataques do mandante; 4 a 6: do visitante' })
  order!: number;

  @ApiProperty({ example: 1 })
  attacking_club_id!: number;

  @ApiProperty({ type: JogadorDoDueloRespostaDto })
  attacker!: JogadorDoDueloRespostaDto;

  @ApiProperty({ type: JogadorDoDueloRespostaDto })
  defender!: JogadorDoDueloRespostaDto;

  @ApiProperty({ example: true, description: 'Ataque maior que a defesa; empate não é gol' })
  goal!: boolean;
}

// E 2.4.2 sem os duelos: o formato da listagem (GET /matches)
export class PartidaResumoRespostaDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '2026-11-12T15:00:00-03:00' })
  played_at!: string;

  @ApiProperty({ type: LadoDaPartidaRespostaDto })
  home!: LadoDaPartidaRespostaDto;

  @ApiProperty({ type: LadoDaPartidaRespostaDto })
  away!: LadoDaPartidaRespostaDto;

  @ApiProperty({ enum: ['MANDANTE', 'VISITANTE', 'EMPATE'], example: 'VISITANTE' })
  result!: ResultadoDaPartida;
}

// E 2.4.2: a partida com os 6 duelos (POST /matches e GET /matches/{id})
export class PartidaRespostaDto extends PartidaResumoRespostaDto {
  @ApiProperty({ type: [DueloRespostaDto] })
  duels!: DueloRespostaDto[];
}

function criarLado(clube: Clube | undefined, formacao: string, gols: number): LadoDaPartidaRespostaDto {
  if (!clube) {
    throw new Error('Partida sem o clube carregado');
  }
  return { club_id: clube.id, club_name: clube.nome, formation: formacao, goals: gols };
}

function criarDuelo(duelo: DueloPartida): DueloRespostaDto {
  return {
    order: duelo.ordem,
    attacking_club_id: duelo.clubeAtacanteId,
    attacker: {
      player_id: duelo.atacanteId,
      player_name: duelo.nomeAtacante,
      position: duelo.posicaoAtacante,
      condition: duelo.condicaoAtacante,
      attribute: duelo.atributoAtaque,
      value: duelo.valorAtaque,
    },
    defender: {
      player_id: duelo.defensorId,
      player_name: duelo.nomeDefensor,
      position: duelo.posicaoDefensor,
      condition: duelo.condicaoDefensor,
      attribute: duelo.atributoDefesa,
      value: duelo.valorDefesa,
    },
    goal: duelo.gol,
  };
}

// Precisa das relações mandante e visitante carregadas; o result vem do placar gravado
export function criarPartidaResumoResposta(partida: Partida): PartidaResumoRespostaDto {
  return {
    id: partida.id,
    played_at: formatarDataHora(partida.jogadaEm),
    home: criarLado(partida.mandante, partida.formacaoMandante, partida.golsMandante),
    away: criarLado(partida.visitante, partida.formacaoVisitante, partida.golsVisitante),
    result: calcularResultado(partida.golsMandante, partida.golsVisitante),
  };
}

// Também precisa da relação duelos; eles saem na ordem 1 a 6 (RN21.2)
export function criarPartidaResposta(partida: Partida): PartidaRespostaDto {
  if (!partida.duelos) {
    throw new Error('Partida sem os duelos carregados');
  }
  const duelos = partida.duelos.toSorted((a, b) => a.ordem - b.ordem);
  return Object.assign(criarPartidaResumoResposta(partida), { duels: duelos.map(criarDuelo) });
}
