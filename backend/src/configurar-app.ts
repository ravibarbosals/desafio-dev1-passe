import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { corpoJsonMiddleware } from '@/core/http/corpo-json.middleware';
import { logRequisicaoMiddleware } from '@/core/http/log-requisicao.middleware';
import { FiltroErroGlobal } from '@/core/erros/filtro-erro-global';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';

function configurarSwagger(app: NestExpressApplication): void {
  const configuracao = new DocumentBuilder().setTitle('API Passe').setDescription('Jogadores, clubes, mercado e liga').setVersion('1.0.0').build();
  const documento = SwaggerModule.createDocument(app, configuracao);
  SwaggerModule.setup('api-docs', app, documento);
}

export function configurarApp(app: NestExpressApplication): void {
  const configService = app.get(ConfigService);

  app.disable('x-powered-by');
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.use(logRequisicaoMiddleware);
  app.use(corpoJsonMiddleware);
  app.enableCors({ origin: [configService.getOrThrow<string>('aplicacao.origemCors')] });
  app.useGlobalPipes(criarValidationPipe());
  app.useGlobalFilters(new FiltroErroGlobal());
  configurarSwagger(app);
}
