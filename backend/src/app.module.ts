import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { criarOpcoesTypeOrm } from '@/core/banco/typeorm.config';
import configAplicacao from '@/core/config/aplicacao.config';
import configBanco from '@/core/config/banco.config';
import { validarEnv } from '@/core/config/validacao-env';
import { SaudeModule } from '@/modulos/saude/saude.module';
import { RelogioModule } from '@/core/comum/relogio/relogio.module';
import { JogadoresModule } from '@/modulos/jogadores/jogador.module';
import { ClubesModule } from '@/modulos/clubes/clube.module';
import { MercadoModule } from '@/modulos/mercado/mercado.module';
import { LigaModule } from '@/modulos/liga/liga.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configAplicacao, configBanco],
      validate: validarEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: criarOpcoesTypeOrm,
    }),
    SaudeModule,
    RelogioModule,
    JogadoresModule,
    ClubesModule,
    MercadoModule,
    LigaModule,
  ],
})
export class AppModule {}
