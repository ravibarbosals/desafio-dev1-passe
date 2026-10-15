import { ValidateBy } from 'class-validator';

// V2: inteiro de verdade no JSON ("15" e 50.5 recusados, sem conversão implícita) e dentro dos limites inclusivos
export function InteiroEntre(minimo: number, maximo: number): PropertyDecorator {
  return ValidateBy({
    name: 'inteiroEntre',
    validator: {
      validate: (valor: unknown) => Number.isInteger(valor) && (valor as number) >= minimo && (valor as number) <= maximo,
      defaultMessage: () => `$property deve ser um inteiro de ${minimo} a ${maximo}.`,
    },
  });
}