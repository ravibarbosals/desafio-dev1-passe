import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { TextoV4 } from '@/core/validacao/texto/texto-v4.decorator';
import { FORMATO_DA_SIGLA, NomeDeClube, SiglaDoNome } from '@/modulos/clubes/dto/validadores-clube';

export class CriarClubeDto {
  @ApiProperty({ example: 'Águias FC', description: '3 a 60 caracteres, 2 a 5 palavras, só letras, espaço, hífen e ponto' })
  @TextoV4(3, 60)
  @NomeDeClube()
  name!: string;

  @ApiProperty({ example: 'AGU', description: 'Três letras maiúsculas tiradas do nome, na ordem, começando pela primeira; não todas iguais' })
  @Matches(FORMATO_DA_SIGLA, { message: '$property deve ter exatamente três letras maiúsculas de A a Z.' })
  @SiglaDoNome()
  acronym!: string;
}
