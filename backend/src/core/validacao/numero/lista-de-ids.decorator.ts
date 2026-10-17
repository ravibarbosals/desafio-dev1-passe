import { ValidateBy } from 'class-validator';

// Maior valor de INTEGER no PostgreSQL: id acima disso nunca existe
const MAIOR_ID = 2_147_483_647;

// Limites (player_ids): lista com exatamente `tamanho` ids distintos, cada um inteiro de verdade no JSON ("3" e 0 recusados)
export function ListaDeIds(tamanho: number): PropertyDecorator {
  return ValidateBy({
    name: 'listaDeIds',
    validator: {
      validate: (valor: unknown) => Array.isArray(valor) && valor.length === tamanho && valor.every((id) => Number.isInteger(id) && id >= 1 && id <= MAIOR_ID) && new Set(valor).size === tamanho,
      defaultMessage: () => `$property deve ser uma lista de ${tamanho} ids distintos, inteiros de 1 a ${MAIOR_ID}.`,
    },
  });
}
