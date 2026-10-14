import { formatarDataHora } from '@/core/comum/data-hora';

describe('formatarDataHora', () => {
  it('converte o instante para o horário de Brasília (RN01)', () => {
    expect(formatarDataHora(new Date('2026-11-02T13:15:00Z'))).toBe('2026-11-02T10:15:00-03:00');
  });

  it('volta para o dia anterior antes das 03:00 UTC', () => {
    expect(formatarDataHora(new Date('2026-11-02T02:30:45.999Z'))).toBe('2026-11-01T23:30:45-03:00');
  });
});
