import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

// Healthcheck do docker compose, fora do /api/v1 e do Swagger (AM-008)
@ApiExcludeController()
@Controller('health')
export class SaudeController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly typeOrmIndicator: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  verificar(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([() => this.typeOrmIndicator.pingCheck('banco', { timeout: 1500 })]);
  }
}
