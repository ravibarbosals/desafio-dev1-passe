import { Global, Module } from '@nestjs/common';
import { Relogio, RelogioDoSistema } from '@/core/comum/relogio/relogio';

// Global: qualquer service injeta o Relogio sem importar este módulo
@Global()
@Module({
  providers: [{ provide: Relogio, useClass: RelogioDoSistema }],
  exports: [Relogio],
})
export class RelogioModule {}
