import { ValidateBy, ValidationArguments } from 'class-validator';
import { siglaCombinaComNome } from '@/modulos/clubes/helpers/nome-de-clube';

// Limites (acronym): três letras de A a Z
export const FORMATO_DA_SIGLA = /^[A-Z]{3}$/;

// Limites (name): só letras, espaço, hífen e ponto; 2 a 5 palavras, e todo pedaço entre espaços precisa ter letra (AM-002)
const caracteresPermitidos = /^[\p{L} .-]*$/u;
const letra = /\p{L}/u;
const MINIMO_DE_PALAVRAS = 2;
const MAXIMO_DE_PALAVRAS = 5;

export function NomeDeClube(): PropertyDecorator {
  return ValidateBy({
    name: 'nomeDeClube',
    validator: {
      validate: (valor: unknown) => {
        if (typeof valor !== 'string') {
          return true;
        }
        const pedacos = valor.split(' ');
        return caracteresPermitidos.test(valor) && pedacos.every((pedaco) => letra.test(pedaco)) && pedacos.length >= MINIMO_DE_PALAVRAS && pedacos.length <= MAXIMO_DE_PALAVRAS;
      },
      defaultMessage: () => `$property deve ter de ${MINIMO_DE_PALAVRAS} a ${MAXIMO_DE_PALAVRAS} palavras, só com letras, espaço, hífen e ponto.`,
    },
  });
}

// Limites (acronym), AM-004: só confere quando a sigla já está no formato; cruza com o nome normalizado pela V4
export function SiglaDoNome(): PropertyDecorator {
  return ValidateBy({
    name: 'siglaDoNome',
    validator: {
      validate: (valor: unknown, argumentos: ValidationArguments) => {
        const nome = (argumentos.object as Record<string, unknown>).name;
        if (typeof valor !== 'string' || !FORMATO_DA_SIGLA.test(valor) || typeof nome !== 'string') {
          return true;
        }
        return new Set(valor).size > 1 && siglaCombinaComNome(valor, nome);
      },
      defaultMessage: () => '$property deve ter letras que não sejam todas iguais, tiradas do nome na ordem e começando pela primeira letra dele.',
    },
  });
}
