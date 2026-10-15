import { transformadorCentavos } from '@/core/banco/transformador-centavos';

describe('transformadorCentavos', () => {
  it.each([
    ['41.44', 4144],
    ['300.00', 30000],
    ['0.05', 5],
    ['-18.90', -1890],
  ])('lê o NUMERIC %s como %d centavos', (valor, centavos) => {
    expect(transformadorCentavos.from(valor)).toBe(centavos);
  });

  it.each([
    [4144, 41.44],
    [30000, 300],
    [-1890, -18.9],
  ])('grava %d centavos como %d', (centavos, valor) => {
    expect(transformadorCentavos.to(centavos)).toBe(valor);
  });

  it('mantém o NULL da coluna opcional (lucro da compra)', () => {
    expect(transformadorCentavos.from(null)).toBeNull();
    expect(transformadorCentavos.to(null)).toBeNull();
  });
});
