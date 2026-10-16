import { calcularComissao } from '@/modulos/mercado/helpers/comissao';

describe('calcularComissao', () => {
  // Tabela de comissão da RN16 do enunciado, em centavos
  it.each([
    [300, 30],
    [385, 39],
    [1000, 100],
    [1001, 100],
    [1500, 200],
    [-750, 0],
  ])('lucro %d → comissão %d', (lucro, comissao) => {
    expect(calcularComissao(lucro)).toBe(comissao);
  });

  it('sem lucro, sem comissão', () => {
    expect(calcularComissao(0)).toBe(0);
  });

  it('soma as faixas antes de arredondar (10,03 → 1,006 → 1,01)', () => {
    expect(calcularComissao(1003)).toBe(101);
  });
});

// Tabela de venda da RN16: crédito = valor − multa − comissão, com as funções juntas
describe('crédito da venda (RN16)', () => {
  it.each([
    [3700, 4000, 400, 3570],
    [5000, 4250, 850, 3400],
    [2615, 3000, 150, 2811],
    [2500, 2500, 0, 2500],
    [6000, 7500, 1000, 6300],
  ])('compra %d, venda %d, multa %d → crédito %d', (compra, venda, multa, credito) => {
    expect(venda - multa - calcularComissao(venda - compra)).toBe(credito);
  });
});
