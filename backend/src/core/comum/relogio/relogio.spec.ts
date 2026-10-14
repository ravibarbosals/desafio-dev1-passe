import { Test } from '@nestjs/testing';
import { Relogio } from '@/core/comum/relogio/relogio';
import { RelogioModule } from '@/core/comum/relogio/relogio.module';

describe('Relogio', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('o módulo entrega o relógio do sistema, que devolve o instante atual', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-02T13:15:00Z') });
    const modulo = await Test.createTestingModule({ imports: [RelogioModule] }).compile();

    expect(modulo.get(Relogio).agora().toISOString()).toBe('2026-11-02T13:15:00.000Z');
  });

  it('pode ser trocado por um relógio fixo nos testes', async () => {
    const instante = new Date('2027-03-02T13:15:00Z');
    const modulo = await Test.createTestingModule({ imports: [RelogioModule] })
      .overrideProvider(Relogio)
      .useValue({ agora: () => instante })
      .compile();

    expect(modulo.get(Relogio).agora()).toBe(instante);
  });
});
