import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { criarErroValidacao } from '@/core/erros/erro-validacao';

// O parâmetro da URL segue como texto para o IdDaUrlPipe: o transform do ValidationPipe global (que roda antes) converteria "01", "1e0" e "+1" em 1 (V8)
class PipeDeValidacao extends ValidationPipe {
  override transform(valor: unknown, metadados: ArgumentMetadata): Promise<unknown> {
    return metadados.type === 'param' ? Promise.resolve(valor) : super.transform(valor, metadados);
  }
}

// DEC-031: campo extra descartado sem erro (whitelist) e sem conversão implícita de tipo; erro → 400 DADOS_INVALIDOS
export function criarValidationPipe(): ValidationPipe {
  return new PipeDeValidacao({ whitelist: true, transform: true, exceptionFactory: criarErroValidacao });
}