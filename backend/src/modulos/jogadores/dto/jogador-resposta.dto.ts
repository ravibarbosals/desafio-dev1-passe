import { ApiProperty } from '@nestjs/swagger';
import { centavosParaNumero } from '@/core/comum/moeda/moeda';
import { CONDICOES_JOGADOR, POSICOES_JOGADOR } from '@/modulos/jogadores/entities/jogador.entity';
import type { CondicaoJogador, Jogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { calcularOverall } from '@/modulos/jogadores/helpers/overall';
import { calcularValorDeMercado } from '@/modulos/jogadores/helpers/valor-de-mercado';

// Formato do exemplo 2.1.3 do enunciado; overall e market_value calculados agora (RN05, RN06), nunca gravados
export class JogadorRespostaDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'Meia Lua' })
  name!: string;

  @ApiProperty({ enum: POSICOES_JOGADOR, example: 'MEI' })
  position!: PosicaoJogador;

  @ApiProperty({ example: 85 })
  agility!: number;

  @ApiProperty({ example: 25 })
  age!: number;

  @ApiProperty({ enum: CONDICOES_JOGADOR, example: 'APTO' })
  condition!: CondicaoJogador;

  @ApiProperty({ example: 40.0, description: 'Calculado no cadastro (RN06); não muda depois' })
  base_value!: number;

  @ApiProperty({ example: 40.0, description: 'Calculado a cada consulta (RN02 a RN05)' })
  market_value!: number;

  @ApiProperty({ example: 70 })
  pace!: number;

  @ApiProperty({ example: 68 })
  shooting!: number;

  @ApiProperty({ example: 82 })
  passing!: number;

  @ApiProperty({ example: 79 })
  dribbling!: number;

  @ApiProperty({ example: 55 })
  defending!: number;

  @ApiProperty({ example: 64 })
  physical!: number;

  @ApiProperty({ example: 86 })
  potential!: number;

  @ApiProperty({ example: 75, description: 'Calculado a cada consulta, pela posição atual (RN06)' })
  overall!: number;

  @ApiProperty({ type: Number, nullable: true, example: null, description: 'null = jogador livre' })
  club_id!: number | null;
}

export function criarJogadorResposta(jogador: Jogador): JogadorRespostaDto {
  return {
    id: jogador.id,
    name: jogador.nome,
    position: jogador.posicao,
    agility: jogador.agilidade,
    age: jogador.idade,
    condition: jogador.condicao,
    base_value: centavosParaNumero(jogador.valorBase),
    market_value: centavosParaNumero(calcularValorDeMercado({ valorBaseCentavos: jogador.valorBase, condicao: jogador.condicao, agilidade: jogador.agilidade, idade: jogador.idade })),
    pace: jogador.velocidade,
    shooting: jogador.finalizacao,
    passing: jogador.passe,
    dribbling: jogador.drible,
    defending: jogador.defesa,
    physical: jogador.fisico,
    potential: jogador.potencial,
    overall: calcularOverall({ posicao: jogador.posicao, atributos: jogador }),
    club_id: jogador.clubeId,
  };
}
