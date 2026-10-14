import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configAplicacao from '@/core/config/aplicacao.config';
import configBanco from '@/core/config/banco.config';
import { validarEnv } from '@/core/config/validacao-env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { criarOpcoesTypeOrm } from '@/core/banco/typeorm.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
