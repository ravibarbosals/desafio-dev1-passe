import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function criarOpcoesTypeOrm(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('banco.host'),
    port: configService.getOrThrow<number>('banco.porta'),
    username: configService.getOrThrow<string>('banco.usuario'),
    password: configService.getOrThrow<string>('banco.senha'),
    database: configService.getOrThrow<string>('banco.nome'),
    autoLoadEntities: true,
    synchronize: false,
  };
}
