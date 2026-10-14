import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { ValidateBy } from 'class-validator';
import { decimalParaCentavos } from '@/core/comum/moeda/moeda';

// Regras de "Filtros e query params aceitos": o valor chega como texto; vazio, repetido (lista) ou fora do formato → 400

interface OpcoesDeLista {
  maximo?: number;
  // Chave usada para recusar repetição; no sort, value_asc e value_desc são o mesmo campo
  campo?: (valor: string) => string;
}

const maiorInteiro = 2147483647;
const formatoInteiro = /^[1-9][0-9]*$/;
const formatoDecimal = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;

function regra(nome: string, validar: (valor: unknown) => boolean, mensagem: string): PropertyDecorator {
  return ValidateBy({ name: nome, validator: { validate: validar, defaultMessage: () => mensagem } });
}

// Inteiro só com dígitos, sem sinal e sem zero à esquerda; entrega number
export function InteiroDeQuery(minimo: number, maximo = maiorInteiro): PropertyDecorator {
  const mensagem = maximo === maiorInteiro ? `$property deve ser um inteiro de ${minimo} ou mais.` : `$property deve ser um inteiro de ${minimo} a ${maximo}.`;
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' && formatoInteiro.test(value) && Number(value) <= maiorInteiro ? Number(value) : value)),
    regra('inteiroDeQuery', (valor) => typeof valor === 'number' && valor >= minimo && valor <= maximo, mensagem),
  );
}

// Decimal na forma 10, 10.5 ou 10.55 (limites em reais); entrega centavos (DEC-037)
export function DecimalDeQuery(minimo: number, maximo: number): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' && formatoDecimal.test(value) ? decimalParaCentavos(value) : value)),
    regra(
      'decimalDeQuery',
      (valor) => typeof valor === 'number' && valor >= minimo * 100 && valor <= maximo * 100,
      `$property deve ser um decimal de ${minimo} a ${maximo}, com até 2 casas, como 10, 10.5 ou 10.55.`,
    ),
  );
}

function lerBooleano(valor: unknown): unknown {
  if (valor === 'true') {
    return true;
  }
  if (valor === 'false') {
    return false;
  }
  return valor;
}

// true ou false, exatamente assim (V5); entrega boolean
export function BooleanoDeQuery(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => lerBooleano(value)),
    regra('booleanoDeQuery', (valor) => typeof valor === 'boolean', '$property deve ser true ou false.'),
  );
}

// Um valor da lista, com as mesmas maiúsculas e minúsculas (V5)
export function ValorDeQuery(valores: readonly string[]): PropertyDecorator {
  return regra('valorDeQuery', (valor) => typeof valor === 'string' && valores.includes(valor), `$property deve ser um destes valores: ${valores.join(', ')}.`);
}

// Só o texto vira lista; um parâmetro repetido (?sort=name&sort=position) chega como array e é recusado
function separarLista(valor: unknown): unknown {
  if (typeof valor === 'string') {
    return valor.split(',');
  }
  return Array.isArray(valor) ? { parametroRepetido: valor } : valor;
}

// Valores da lista separados por vírgula, sem espaços e sem repetir; entrega string[]
export function ListaDeQuery(valores: readonly string[], { maximo = valores.length, campo = (valor) => valor }: OpcoesDeLista = {}): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => separarLista(value)),
    regra(
      'listaDeQuery',
      (valor) => {
        if (!Array.isArray(valor) || valor.length > maximo || !valor.every((item) => typeof item === 'string' && valores.includes(item))) {
          return false;
        }
        const campos = (valor as string[]).map(campo);
        return new Set(campos).size === campos.length;
      },
      `$property deve ter de 1 a ${maximo} valores entre ${valores.join(', ')}, separados por vírgula, sem espaços e sem repetir.`,
    ),
  );
}
