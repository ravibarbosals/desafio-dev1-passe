import { arredondarMeioLongeDoZero } from '@/core/comum/arredondamento/arredondamento';

const LIMITE_DA_PRIMEIRA_FAIXA = 1000;

// RN16, item 3: 10% até 10,00 de lucro e 20% acima, somados e arredondados uma vez; sem lucro, 0; em centavos (DEC-037)
export function calcularComissao(lucroCentavos: number): number {
  if (lucroCentavos <= 0) {
    return 0;
  }
  const primeiraFaixa = Math.min(lucroCentavos, LIMITE_DA_PRIMEIRA_FAIXA);
  const segundaFaixa = Math.max(lucroCentavos - LIMITE_DA_PRIMEIRA_FAIXA, 0);
  return arredondarMeioLongeDoZero(10 * primeiraFaixa + 20 * segundaFaixa, 100);
}
