import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { SaudeController } from '@/modulos/saude/saude.controller';

describe('SaudeController', () => {
  it('confere a conexão com o banco', async () => {
    const pingCheck = vi.fn().mockResolvedValue({ banco: { status: 'up' } });
    const check = vi.fn((indicadores: (() => Promise<unknown>)[]) => Promise.all(indicadores.map((indicador) => indicador())));
    const controller = new SaudeController({ check } as unknown as HealthCheckService, { pingCheck } as unknown as TypeOrmHealthIndicator);

    await controller.verificar();

    expect(pingCheck).toHaveBeenCalledWith('banco', { timeout: 1500 });
  });
});
