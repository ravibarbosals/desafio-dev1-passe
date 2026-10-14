import { registerAs } from '@nestjs/config';

export default registerAs('aplicacao', () => ({
  porta: Number(process.env.APP_PORT),
  origemCors: process.env.CORS_ORIGIN,
}));
