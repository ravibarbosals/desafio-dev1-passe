import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configAplicacao from '@/core/config/aplicacao.config';
import configBanco from '@/core/config/banco.config';
import { validarEnv } from '@/core/config/validacao-env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configAplicacao, configBanco],
      validate: validarEnv,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
