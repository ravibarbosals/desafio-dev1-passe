import { calcularValorBase } from '@/modulos/jogadores/helpers/valor-base';

describe('calcularValorBase', () => {
  // Exemplos de valor base da RN06 do enunciado: overall, potencial, idade no cadastro → valor base, em centavos
  it.each([
    [75, 86, 25, 4000],
    [60, 70, 30, 1000],
    [61, 70, 30, 1200],
    [76, 80, 22, 4600],
    [85, 92, 27, 10000],
    [70, 84, 21, 3420],
    [70, 84, 22, 3000],
    [45, 90, 18, 363],
    [40, 66, 36, 100],
  ])('overall %d, potencial %d, %d anos → %d', (overall, potencial, idadeNoCadastro, esperado) => {
    expect(calcularValorBase({ overall, potencial, idadeNoCadastro })).toBe(esperado);
  });

  it.each([
    [40, 100],
    [41, 100],
    [99, 18400],
  ])('limite das faixas: overall %d com 30 anos → %d', (overall, esperado) => {
    expect(calcularValorBase({ overall, potencial: 99, idadeNoCadastro: 30 })).toBe(esperado);
  });
});
