import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module';
import { configurarApp } from '@/configurar-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  configurarApp(app);
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('aplicacao.porta'));
}
void bootstrap();
