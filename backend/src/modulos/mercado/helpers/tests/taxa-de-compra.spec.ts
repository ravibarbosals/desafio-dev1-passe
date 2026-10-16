import { calcularTaxaDeCompra } from '@/modulos/mercado/helpers/taxa-de-compra';

describe('calcularTaxaDeCompra', () => {
  // Tabela da RN13 do enunciado, em centavos
  it.each([
    [2800, 0],
    [3000, 0],
    [3001, 150],
    [4762, 238],
    [4800, 240],
  ])('valor %d → taxa %d', (valor, taxa) => {
    expect(calcularTaxaDeCompra(valor)).toBe(taxa);
  });

  it('arredonda o meio para longe do zero (10,10 × 5% = 0,505 → 0,51)', () => {
    expect(calcularTaxaDeCompra(3010)).toBe(151);
  });
});
