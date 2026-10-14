import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { ValidateBy } from 'class-validator';
import { lerDataHora } from '@/core/comum/data-hora/data-hora';

// RN01: aceita só AAAA-MM-DDTHH:MM-03:00 com data real e entrega o instante (Date) ao service
export function DataHoraBrasilia(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? (lerDataHora(value) ?? value) : value)),
    ValidateBy({
      name: 'dataHoraBrasilia',
      validator: {
        validate: (valor: unknown) => valor instanceof Date,
        defaultMessage: () => '$property deve ser uma data e hora válida no formato AAAA-MM-DDTHH:MM-03:00.',
      },
    }),
  );
}
