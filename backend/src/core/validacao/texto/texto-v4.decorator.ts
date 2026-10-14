import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, ValidateBy } from 'class-validator';
import { contarCaracteres, normalizarTexto, temCaractereDeControle } from '@/core/comum/texto/texto';

// V4: normaliza (NFC e espaços) antes de validar; recusa caractere de controle e mede o tamanho em pontos de código
export function TextoV4(minimo: number, maximo: number): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? normalizarTexto(value) : value)),
    IsString({ message: '$property deve ser um texto.' }),
    ValidateBy({
      name: 'semCaractereDeControle',
      validator: {
        validate: (valor: unknown) => typeof valor !== 'string' || !temCaractereDeControle(valor),
        defaultMessage: () => '$property não pode ter caracteres de controle, como tabulação ou quebra de linha.',
      },
    }),
    ValidateBy({
      name: 'tamanhoEmCaracteres',
      validator: {
        validate: (valor: unknown) => typeof valor !== 'string' || (contarCaracteres(valor) >= minimo && contarCaracteres(valor) <= maximo),
        defaultMessage: () => `$property deve ter de ${minimo} a ${maximo} caracteres.`,
      },
    }),
  );
}
