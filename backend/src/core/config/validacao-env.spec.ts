import { validarEnv } from '@/core/config/validacao-env';

const envValido = {
  APP_PORT: '3000',
  CORS_ORIGIN: 'http://localhost:5173',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_USER: 'postgres',
  DATABASE_PASSWORD: 'postgres',
  DATABASE_NAME: 'passe',
};

describe('validarEnv', () => {
  it('aceita o env completo e devolve o mesmo objeto', () => {
    expect(validarEnv(envValido)).toBe(envValido);
  });

  it('recusa variável ausente ou vazia, listando todas', () => {
    expect(() => validarEnv({ ...envValido, CORS_ORIGIN: undefined, DATABASE_NAME: '' })).toThrow(/CORS_ORIGIN não definida\n- DATABASE_NAME não definida/);
  });

  it.each(['abc', '3000.5', '0', '65536'])('recusa a porta %s', (porta) => {
    expect(() => validarEnv({ ...envValido, APP_PORT: porta })).toThrow('APP_PORT deve ser um inteiro entre 1 e 65535');
  });
});
