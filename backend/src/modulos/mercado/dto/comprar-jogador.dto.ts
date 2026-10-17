import { ApiProperty } from '@nestjs/swagger';
import { DataHoraBrasilia } from '@/core/validacao/data-hora/data-hora-brasilia.decorator';
import { InteiroEntre } from '@/core/validacao/numero/inteiro-entre.decorator';

// Maior valor de INTEGER no PostgreSQL: id acima disso nunca existe
const MAIOR_ID = 2_147_483_647;

// Limites dos campos da compra: formato aqui (400 DADOS_INVALIDOS); o prazo da fidelidade depende de "agora" e fica no service
export class ComprarJogadorDto {
  @ApiProperty({ example: 1, description: 'Clube inexistente → 404' })
  @InteiroEntre(1, MAIOR_ID)
  club_id!: number;

  @ApiProperty({ type: String, example: '2027-03-02T10:15-03:00', description: 'Brasília (RN01); depois de agora e até 1.095 dias' })
  @DataHoraBrasilia()
  loyalty_until!: Date;
}
