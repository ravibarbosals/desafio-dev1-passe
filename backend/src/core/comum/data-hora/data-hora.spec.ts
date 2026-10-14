import { formatarDataHora, lerDataHora } from '@/core/comum/data-hora/data-hora';

describe('formatarDataHora', () => {
  it('converte o instante para o horário de Brasília (RN01)', () => {
    expect(formatarDataHora(new Date('2026-11-02T13:15:00Z'))).toBe('2026-11-02T10:15:00-03:00');
  });

  it('volta para o dia anterior antes das 03:00 UTC', () => {
    expect(formatarDataHora(new Date('2026-11-02T02:30:45.999Z'))).toBe('2026-11-01T23:30:45-03:00');
  });
});

describe('lerDataHora', () => {
  it('converte o horário de Brasília para o instante (RN01)', () => {
    expect(lerDataHora('2027-03-02T10:15-03:00')?.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it('passa para o dia seguinte depois das 21:00', () => {
    expect(lerDataHora('2027-12-31T22:30-03:00')?.toISOString()).toBe('2028-01-01T01:30:00.000Z');
  });

  it('aceita 29 de fevereiro em ano bissexto', () => {
    expect(lerDataHora('2028-02-29T10:00-03:00')?.toISOString()).toBe('2028-02-29T13:00:00.000Z');
  });

  it.each([
    '2027-03-02T10:15',
    '2027-03-02T10:15:00-03:00',
    '2027-03-02T10:15Z',
    '2027-03-02T10:15-02:00',
    '2027-02-30T10:15-03:00',
    '2027-02-29T10:15-03:00',
    '2100-02-29T10:15-03:00',
    '2027-04-31T10:15-03:00',
    '2027-13-01T10:15-03:00',
    '2027-00-10T10:15-03:00',
    '2027-03-00T10:15-03:00',
    '2027-03-02T24:00-03:00',
    '2027-03-02T10:60-03:00',
    ' 2027-03-02T10:15-03:00',
  ])('recusa %j', (texto) => {
    expect(lerDataHora(texto)).toBeNull();
  });

  it('volta ao mesmo texto quando formatado (com segundos)', () => {
    expect(formatarDataHora(lerDataHora('2026-11-02T10:15-03:00')!)).toBe('2026-11-02T10:15:00-03:00');
  });
});
