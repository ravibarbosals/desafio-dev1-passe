import { ValidateBy, ValidationArguments } from 'class-validator';

function valorDe(argumentos: ValidationArguments, campo: string): unknown {
  return (argumentos.object as Record<string, unknown>)[campo];
}

// Faixa contraditória (min_age > max_age, min_value > max_value) → 400; só compara quando os dois vieram válidos
export function MenorOuIgualA(outroCampo: string): PropertyDecorator {
  return ValidateBy({
    name: 'menorOuIgualA',
    validator: {
      validate: (valor: unknown, argumentos: ValidationArguments) => {
        const outro = valorDe(argumentos, outroCampo);
        return typeof valor !== 'number' || typeof outro !== 'number' || valor <= outro;
      },
      defaultMessage: () => `$property não pode ser maior que ${outroCampo}.`,
    },
  });
}

// Combinação proibida (free=true com club_id) → 400
export function ProibidoJuntoCom(outroCampo: string, quando: (valor: unknown) => boolean): PropertyDecorator {
  return ValidateBy({
    name: 'proibidoJuntoCom',
    validator: {
      validate: (valor: unknown, argumentos: ValidationArguments) => !quando(valor) || valorDe(argumentos, outroCampo) === undefined,
      defaultMessage: () => `$property não pode ser combinado com ${outroCampo}.`,
    },
  });
}

export function DiferenteDe(outroCampo: string): PropertyDecorator {
  return ValidateBy({
    name: 'diferenteDe',
    validator: {
      validate: (valor: unknown, argumentos: ValidationArguments) => {
        const outro = valorDe(argumentos, outroCampo);
        return typeof valor !== 'number' || typeof outro !== 'number' || valor !== outro;
      },
      defaultMessage: () => `$property deve ser diferente de ${outroCampo}.`,
    },
  });
}
