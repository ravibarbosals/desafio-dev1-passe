const variaveisObrigatorias = ['APP_PORT', 'CORS_ORIGIN', 'DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'] as const;

const variaveisDePorta = ['APP_PORT', 'DATABASE_PORT'] as const;

const portaMaxima = 65535;

export function validarEnv(env: Record<string, unknown>): Record<string, unknown> {
  const erros: string[] = [];

  for (const nome of variaveisObrigatorias) {
    if (env[nome] === undefined || env[nome] === '') {
      erros.push(`${nome} não definida`);
    }
  }

  for (const nome of variaveisDePorta) {
    const valor = env[nome];
    if (valor === undefined || valor === '') {
      continue;
    }
    const porta = Number(valor);
    if (!Number.isInteger(porta) || porta < 1 || porta > portaMaxima) {
      erros.push(`${nome} deve ser um inteiro entre 1 e ${portaMaxima}`);
    }
  }

  if (erros.length > 0) {
    throw new Error(`Variáveis de ambiente inválidas:\n- ${erros.join('\n- ')}`);
  }

  return env;
}
