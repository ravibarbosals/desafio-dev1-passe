import { calcularValorDeMercado } from '@/modulos/jogadores/helpers/valor-de-mercado';
import type { CondicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

describe('calcularValorDeMercado', () => {
  // Tabela da RN05 do enunciado: valor base, condição, agilidade, idade → valor de mercado, em centavos
  it.each<[number, CondicaoJogador, number, number, number]>([
    [8200, 'APTO', 20, 25, 8200],
    [8200, 'APTO', 50, 19, 9020],
    [8200, 'MAL_CONDICIONADO', 50, 25, 6970],
    [8200, 'MAL_CONDICIONADO', 80, 21, 8405],
    [8200, 'MAL_CONDICIONADO', 30, 33, 5330],
    [8200, 'DOENTE', 90, 25, 6970],
    [8200, 'DOENTE', 30, 25, 4920],
    [8200, 'DOENTE', 10, 40, 4920],
    [950, 'MAL_CONDICIONADO', 85, 25, 879],
    [100, 'MAL_CONDICIONADO', 50, 35, 100],
  ])('base %d, %s, agilidade %d, %d anos → %d', (valorBaseCentavos, condicao, agilidade, idade, esperado) => {
    expect(calcularValorDeMercado({ valorBaseCentavos, condicao, agilidade, idade })).toBe(esperado);
  });

  it.each<[CondicaoJogador, number, number]>([
    ['MAL_CONDICIONADO', 30, 7500],
    ['MAL_CONDICIONADO', 31, 8500],
    ['DOENTE', 79, 7000],
    ['DOENTE', 80, 8500],
  ])('limite da agilidade: %s com agilidade %d → %d', (condicao, agilidade, esperado) => {
    expect(calcularValorDeMercado({ valorBaseCentavos: 10000, condicao, agilidade, idade: 25 })).toBe(esperado);
  });

  it.each([
    [21, 11000],
    [22, 10000],
    [31, 10000],
    [32, 9000],
  ])('limite da idade: APTO com %d anos → %d', (idade, esperado) => {
    expect(calcularValorDeMercado({ valorBaseCentavos: 10000, condicao: 'APTO', agilidade: 10, idade })).toBe(esperado);
  });

  it('sobe para o piso de 1,00', () => {
    expect(calcularValorDeMercado({ valorBaseCentavos: 100, condicao: 'APTO', agilidade: 50, idade: 40 })).toBe(100);
  });
});
