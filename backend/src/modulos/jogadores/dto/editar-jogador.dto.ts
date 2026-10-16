import { PickType } from '@nestjs/swagger';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';

// RN08: só os quatro campos editáveis, com as validações do cadastro (inclusive agilidade ≤ 85 aos 35+, PR-004); os outros são descartados (V7)
export class EditarJogadorDto extends PickType(CriarJogadorDto, ['name', 'position', 'agility', 'age'] as const) {}
