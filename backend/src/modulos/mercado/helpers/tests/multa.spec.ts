import { calcularDiasRestantes, calcularMulta, percentualDeMulta } from '@/modulos/mercado/helpers/multa';

const agora = new Date('2026-11-02T13:15:00Z');
const minuto = 60 * 1000;
const hora = 60 * minuto;
const dia = 24 * hora;

function depoisDeAgora(ms: number): Date {
  return new Date(agora.getTime() + ms);
}

describe('calcularDiasRestantes', () => {
  // Tabela da RN15 do enunciado, com o exemplo do item 1 e o erro da ficha de avaliação (30 d 6 h → 31, e não 30)
  it.each([
    ['já passou', -dia, 0],
    ['exatamente agora', 0, 0],
    ['1 ms depois', 1, 1],
    ['10 dias e 2 horas', 10 * dia + 2 * hora, 11],
    ['exatamente 30 dias', 30 * dia, 30],
    ['30 dias e 1 minuto', 30 * dia + minuto, 31],
    ['30 dias e 6 horas', 30 * dia + 6 * hora, 31],
    ['exatamente 180 dias', 180 * dia, 180],
    ['180 dias e 1 minuto', 180 * dia + minuto, 181],
    ['200 dias', 200 * dia, 200],
    ['116 dias, 17 horas e 35 minutos', 116 * dia + 17 * hora + 35 * minuto, 117],
  ])('%s → %d', (_caso, diferenca, dias) => {
    expect(calcularDiasRestantes(depoisDeAgora(diferenca), agora)).toBe(dias);
  });
});

describe('percentualDeMulta', () => {
  it.each([
    [0, 0],
    [1, 5],
    [30, 5],
    [31, 10],
    [180, 10],
    [181, 20],
    [1095, 20],
  ])('%d dias → %d%%', (dias, percentual) => {
    expect(percentualDeMulta(dias)).toBe(percentual);
  });
});

describe('calcularMulta', () => {
  // Coluna "Multa" da tabela de venda da RN16, em centavos
  it.each([
    [4000, 10, 400],
    [4250, 20, 850],
    [3000, 5, 150],
    [2500, 0, 0],
  ])('%d × %d%% → %d', (valor, percentual, multa) => {
    expect(calcularMulta(valor, percentual)).toBe(multa);
  });

  it('limita a multa a 10,00 (20% de 75,00 = 15,00 → 10,00)', () => {
    expect(calcularMulta(7500, 20)).toBe(1000);
  });

  it('aceita exatamente 10,00 (20% de 50,00)', () => {
    expect(calcularMulta(5000, 20)).toBe(1000);
  });

  it('arredonda o meio para longe do zero (5% de 10,10 = 0,505 → 0,51)', () => {
    expect(calcularMulta(1010, 5)).toBe(51);
  });
});
