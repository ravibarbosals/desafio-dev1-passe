import { calcularOverall } from '@/modulos/jogadores/helpers/overall';
import type { AtributosJogador } from '@/modulos/jogadores/helpers/overall';
import type { PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

describe('calcularOverall', () => {
  // Exemplos de overall da RN06 do enunciado
  it.each<[PosicaoJogador, number, AtributosJogador]>([
    ['MEI', 73, { velocidade: 68, finalizacao: 65, passe: 80, drible: 78, defesa: 52, fisico: 60 }],
    ['ATA', 76, { velocidade: 78, finalizacao: 75, passe: 73, drible: 82, defesa: 48, fisico: 68 }],
    ['LAT', 72, { velocidade: 72, finalizacao: 70, passe: 78, drible: 76, defesa: 70, fisico: 66 }],
    ['ZAG', 73, { velocidade: 50, finalizacao: 90, passe: 60, drible: 40, defesa: 80, fisico: 75 }],
    ['GOL', 68, { velocidade: 55, finalizacao: 30, passe: 65, drible: 40, defesa: 72, fisico: 68 }],
  ])('%s → %d', (posicao, esperado, atributos) => {
    expect(calcularOverall({ posicao, atributos })).toBe(esperado);
  });

  it('muda com a posição, para os mesmos atributos (PUT que troca a posição)', () => {
    const atributos = { velocidade: 50, finalizacao: 90, passe: 60, drible: 40, defesa: 80, fisico: 75 };
    expect(calcularOverall({ posicao: 'ZAG', atributos })).toBe(73);
    expect(calcularOverall({ posicao: 'ATA', atributos })).toBe(68);
  });
});
