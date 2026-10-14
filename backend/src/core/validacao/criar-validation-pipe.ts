import { ValidationPipe } from '@nestjs/common';
import { criarErroValidacao } from '@/core/erros/erro-validacao';

// DEC-031: campo extra descartado sem erro (whitelist) e sem conversão implícita de tipo; erro → 400 DADOS_INVALIDOS
export function criarValidationPipe(): ValidationPipe {
  return new ValidationPipe({ whitelist: true, transform: true, exceptionFactory: criarErroValidacao });
}
