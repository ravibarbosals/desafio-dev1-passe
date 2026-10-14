import { registerAs } from '@nestjs/config';

export default registerAs('banco', () => ({
  host: process.env.DATABASE_HOST,
  porta: Number(process.env.DATABASE_PORT),
  usuario: process.env.DATABASE_USER,
  senha: process.env.DATABASE_PASSWORD,
  nome: process.env.DATABASE_NAME,
}));
