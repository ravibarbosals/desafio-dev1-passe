import { arredondarMeioLongeDoZero } from '@/core/comum/arredondamento/arredondamento';

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
const TETO_DA_MULTA = 1000;

// RN15, item 1: dias com fração arredondados para cima; fim já passado ou igual ao agora → 0
export function calcularDiasRestantes(fim: Date, agora: Date): number {
  const restante = fim.getTime() - agora.getTime();
  return restante > 0 ? Math.ceil(restante / UM_DIA_EM_MS) : 0;
}

// RN15, item 2: percentual inteiro, no formato do penalty_rate da API
export function percentualDeMulta(diasRestantes: number): number {
  if (diasRestantes === 0) {
    return 0;
  }
  if (diasRestantes <= 30) {
    return 5;
  }
  return diasRestantes <= 180 ? 10 : 20;
}

// RN15, item 3: arredondada uma vez e limitada a 10,00; em centavos (DEC-037)
export function calcularMulta(valorDeMercadoCentavos: number, percentual: number): number {
  return Math.min(arredondarMeioLongeDoZero(valorDeMercadoCentavos * percentual, 100), TETO_DA_MULTA);
}
