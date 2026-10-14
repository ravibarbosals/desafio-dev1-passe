import { centavosParaNumero, decimalParaCentavos } from '@/core/comum/moeda/moeda';

describe('centavosParaNumero', () => {
  it.each([
    [4144, 41.44],
    [30000, 300],
    [5, 0.05],
    [-1890, -18.9],
  ])('%d centavos → %d', (centavos, esperado) => {
    expect(centavosParaNumero(centavos)).toBe(esperado);
  });
});

describe('decimalParaCentavos', () => {
  it.each([
    ['41.44', 4144],
    ['12.5', 1250],
    ['300', 30000],
    ['0.05', 5],
    ['-18.90', -1890],
    ['550.00', 55000],
  ])('%s → %d centavos', (texto, esperado) => {
    expect(decimalParaCentavos(texto)).toBe(esperado);
  });

  it('não devolve −0', () => {
    expect(Object.is(decimalParaCentavos('-0.00'), 0)).toBe(true);
  });

  it.each(['', 'abc', '1.234', '1,50', '.5', '1e3'])('recusa %j', (texto) => {
    expect(() => decimalParaCentavos(texto)).toThrow(RangeError);
  });
});
