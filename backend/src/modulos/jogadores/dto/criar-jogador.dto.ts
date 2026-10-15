import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { InteiroEntre } from '@/core/validacao/numero/inteiro-entre.decorator';
import { TextoV4 } from '@/core/validacao/texto/texto-v4.decorator';
import { POSICOES_JOGADOR } from '@/modulos/jogadores/entities/jogador.entity';
import type { PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { AgilidadeLimitadaPelaIdade, NomeDeJogador, PotencialCompativel, SomaDosAtributosLimitada } from '@/modulos/jogadores/dto/validadores-jogador';

// Só os campos do cadastro (V7): club_id, condition, base_value, overall e market_value enviados são descartados
export class CriarJogadorDto {
  @ApiProperty({ example: 'Meia Lua', description: '3 a 100 caracteres, pelo menos duas palavras, nenhum dígito' })
  @TextoV4(3, 100)
  @NomeDeJogador()
  name!: string;

  @ApiProperty({ enum: POSICOES_JOGADOR, example: 'MEI' })
  @IsIn(POSICOES_JOGADOR, { message: `$property deve ser um destes valores: ${POSICOES_JOGADOR.join(', ')}.` })
  position!: PosicaoJogador;

  @ApiProperty({ example: 85, minimum: 1, maximum: 100, description: 'No máximo 85 com 35 anos ou mais' })
  @InteiroEntre(1, 100)
  @AgilidadeLimitadaPelaIdade()
  agility!: number;

  @ApiProperty({ example: 25, minimum: 16, maximum: 45 })
  @InteiroEntre(16, 45)
  age!: number;

  @ApiProperty({ example: 70, minimum: 1, maximum: 99 })
  @InteiroEntre(1, 99)
  pace!: number;

  @ApiProperty({ example: 68, minimum: 1, maximum: 99 })
  @InteiroEntre(1, 99)
  shooting!: number;

  @ApiProperty({ example: 82, minimum: 1, maximum: 99 })
  @InteiroEntre(1, 99)
  passing!: number;

  @ApiProperty({ example: 79, minimum: 1, maximum: 99 })
  @InteiroEntre(1, 99)
  dribbling!: number;

  @ApiProperty({ example: 55, minimum: 1, maximum: 99 })
  @InteiroEntre(1, 99)
  defending!: number;

  @ApiProperty({ example: 64, minimum: 1, maximum: 99, description: 'A soma dos seis atributos não pode passar de 480' })
  @InteiroEntre(1, 99)
  @SomaDosAtributosLimitada()
  physical!: number;

  @ApiProperty({ example: 86, minimum: 1, maximum: 99, description: 'Maior ou igual ao maior dos seis atributos; com 33 anos ou mais, igual a ele' })
  @InteiroEntre(1, 99)
  @PotencialCompativel()
  potential!: number;
}