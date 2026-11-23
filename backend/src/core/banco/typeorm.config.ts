import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function criarOpcoesTypeOrm(configService: ConfigService): TypeOrmModuleOptions {
  // DEC-073: com DATABASE_SSL_CA, SSL verificando o servidor; sem ela (local e Docker), sem SSL
  const certificadoCa = configService.get<string>('banco.certificadoCa');
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('banco.host'),
    port: configService.getOrThrow<number>('banco.porta'),
    username: configService.getOrThrow<string>('banco.usuario'),
    password: configService.getOrThrow<string>('banco.senha'),
    database: configService.getOrThrow<string>('banco.nome'),
    ssl: certificadoCa ? { ca: certificadoCa } : false,
    autoLoadEntities: true,
    synchronize: false,
  };
}
