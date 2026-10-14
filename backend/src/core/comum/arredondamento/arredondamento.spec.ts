import { arredondarMeioLongeDoZero, arredondarMeioParaCima } from '@/core/comum/arredondamento/arredondamento';

describe('arredondarMeioLongeDoZero', () => {
  it.each([
    ['14,775 → 14,78', 14775, 10, 1478],
    ['0,385 → 0,39', 385, 10, 39],
    ['−0,385 → −0,39', -385, 10, -39],
    ['8,7875 → 8,79', 87875, 100, 879],
    ['1,5005 → 1,50', 15005, 100, 150],
    ['3,625 → 3,63', 3625, 10, 363],
  ])('%s (exemplos do enunciado, em centavos)', (_caso, numerador, denominador, esperado) => {
    expect(arredondarMeioLongeDoZero(numerador, denominador)).toBe(esperado);
  });

  it('não devolve −0', () => {
    expect(Object.is(arredondarMeioLongeDoZero(-1, 10), 0)).toBe(true);
  });

  it('aceita denominador negativo', () => {
    expect(arredondarMeioLongeDoZero(385, -10)).toBe(-39);
  });

  it.each([
    [1, 0],
    [1.5, 2],
    [1, 0.5],
  ])('recusa a fração %d/%d', (numerador, denominador) => {
    expect(() => arredondarMeioLongeDoZero(numerador, denominador)).toThrow(RangeError);
  });
});

describe('arredondarMeioParaCima', () => {
  it.each([
    [145, 10, 15],
    [144, 10, 14],
    [-145, 10, -14],
    [-146, 10, -15],
    [-5, 10, 0],
  ])('%d/%d → %d', (numerador, denominador, esperado) => {
    expect(arredondarMeioParaCima(numerador, denominador)).toBe(esperado);
  });

  it('coincide com o meio longe do zero para positivos', () => {
    expect(arredondarMeioParaCima(3625, 10)).toBe(arredondarMeioLongeDoZero(3625, 10));
  });
});
