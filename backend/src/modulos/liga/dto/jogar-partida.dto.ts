import { ApiProperty } from '@nestjs/swagger';
import { DiferenteDe } from '@/core/validacao/comparacao/comparacao.decorators';
import { InteiroEntre } from '@/core/validacao/numero/inteiro-entre.decorator';

// Maior valor de INTEGER no PostgreSQL: id acima disso nunca existe
const MAIOR_ID = 2_147_483_647;

// Formato e mandante ≠ visitante aqui (400 DADOS_INVALIDOS); existência (404) e escalação (409) no service (RN20.1)
export class JogarPartidaDto {
  @ApiProperty({ example: 1, description: 'Clube mandante: ataca nos duelos 1 a 3' })
  @InteiroEntre(1, MAIOR_ID)
  home_club_id!: number;

  @ApiProperty({ example: 2, description: 'Clube visitante, diferente do mandante: ataca nos duelos 4 a 6' })
  @InteiroEntre(1, MAIOR_ID)
  @DiferenteDe('home_club_id')
  away_club_id!: number;
}
