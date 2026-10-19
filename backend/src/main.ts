import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module';
import { montarBanner } from '@/core/comum/banner/banner';
import { configurarApp } from '@/configurar-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  configurarApp(app);
  const configService = app.get(ConfigService);
  const porta = configService.getOrThrow<number>('aplicacao.porta');
  await app.listen(porta);
  process.stdout.write(montarBanner(porta));
}
void bootstrap();
