import { ValidateBy, ValidationArguments } from 'class-validator';

// Regras de "Limites de cada campo" que cruzam campos do jogador; só comparam quando os campos envolvidos vieram inteiros
const ATRIBUTOS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
const SOMA_MAXIMA_DOS_ATRIBUTOS = 480;
const IDADE_DO_POTENCIAL_FIXO = 33;
const IDADE_DA_AGILIDADE_LIMITADA = 35;
const AGILIDADE_MAXIMA_AOS_35 = 85;
const letra = /\p{L}/u;
const digito = /[0-9]/;

function lerInteiro(argumentos: ValidationArguments, campo: string): number | undefined {
  const valor = (argumentos.object as Record<string, unknown>)[campo];
  return Number.isInteger(valor) ? (valor as number) : undefined;
}

function lerAtributos(argumentos: ValidationArguments): number[] | undefined {
  const valores = ATRIBUTOS.map((campo) => lerInteiro(argumentos, campo));
  return valores.every((valor) => valor !== undefined) ? (valores as number[]) : undefined;
}

// V4 (definições) e AM-003: palavra é um pedaço entre espaços com pelo menos uma letra; pedaço sem letra é aceito e não conta
export function NomeDeJogador(): PropertyDecorator {
  return ValidateBy({
    name: 'nomeDeJogador',
    validator: {
      validate: (valor: unknown) => typeof valor !== 'string' || (!digito.test(valor) && valor.split(' ').filter((pedaco) => letra.test(pedaco)).length >= 2),
      defaultMessage: () => '$property deve ter pelo menos duas palavras e nenhum dígito.',
    },
  });
}

export function SomaDosAtributosLimitada(): PropertyDecorator {
  return ValidateBy({
    name: 'somaDosAtributosLimitada',
    validator: {
      validate: (_valor: unknown, argumentos: ValidationArguments) => {
        const atributos = lerAtributos(argumentos);
        return atributos === undefined || atributos.reduce((soma, atributo) => soma + atributo, 0) <= SOMA_MAXIMA_DOS_ATRIBUTOS;
      },
      defaultMessage: () => `A soma de ${ATRIBUTOS.join(', ')} não pode passar de ${SOMA_MAXIMA_DOS_ATRIBUTOS}.`,
    },
  });
}

// RN06.1: nunca menor que o maior dos seis atributos; no cadastro com 33 anos ou mais, igual a ele
export function PotencialCompativel(): PropertyDecorator {
  return ValidateBy({
    name: 'potencialCompativel',
    validator: {
      validate: (valor: unknown, argumentos: ValidationArguments) => {
        const atributos = lerAtributos(argumentos);
        const idade = lerInteiro(argumentos, 'age');
        if (!Number.isInteger(valor) || atributos === undefined) {
          return true;
        }
        const maiorAtributo = Math.max(...atributos);
        return idade !== undefined && idade >= IDADE_DO_POTENCIAL_FIXO ? valor === maiorAtributo : (valor as number) >= maiorAtributo;
      },
      defaultMessage: () => `$property deve ser maior ou igual ao maior dos seis atributos e, com ${IDADE_DO_POTENCIAL_FIXO} anos ou mais, igual a ele.`,
    },
  });
}

// Vale no cadastro e na edição (PR-004)
export function AgilidadeLimitadaPelaIdade(): PropertyDecorator {
  return ValidateBy({
    name: 'agilidadeLimitadaPelaIdade',
    validator: {
      validate: (valor: unknown, argumentos: ValidationArguments) => {
        const idade = lerInteiro(argumentos, 'age');
        return !Number.isInteger(valor) || idade === undefined || idade < IDADE_DA_AGILIDADE_LIMITADA || (valor as number) <= AGILIDADE_MAXIMA_AOS_35;
      },
      defaultMessage: () => `$property deve ser no máximo ${AGILIDADE_MAXIMA_AOS_35} para jogadores com ${IDADE_DA_AGILIDADE_LIMITADA} anos ou mais.`,
    },
  });
}
