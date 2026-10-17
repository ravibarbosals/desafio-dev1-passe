import { fidelidadeDentroDoPrazo } from '@/modulos/mercado/helpers/fidelidade';

// 02/11/2026, 10h15 em Brasília (exemplo 2.3.1)
const agora = new Date('2026-11-02T13:15:00Z');
const umMinuto = 60 * 1000;
const umDia = 24 * 60 * umMinuto;

describe('fidelidadeDentroDoPrazo', () => {
  it.each([
    ['o exemplo 2.3.1 (02/03/2027, 10h15)', new Date('2027-03-02T13:15:00Z'), true],
    ['um minuto depois de agora', new Date(agora.getTime() + umMinuto), true],
    ['exatamente agora + 1.095 dias', new Date(agora.getTime() + 1095 * umDia), true],
    ['o próprio instante de agora', agora, false],
    ['um minuto antes de agora', new Date(agora.getTime() - umMinuto), false],
    ['agora + 1.095 dias e 1 minuto', new Date(agora.getTime() + 1095 * umDia + umMinuto), false],
  ])('%s → %s', (_caso, fim, esperado) => {
    expect(fidelidadeDentroDoPrazo(fim, agora)).toBe(esperado);
  });
});