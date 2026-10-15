import { arredondarMeioLongeDoZero } from '@/core/comum/arredondamento/arredondamento';

// RN06: centavos por ponto de overall dentro de cada faixa; até 40 não soma nada
const FAIXAS_DO_OVERALL = [
  { inicio: 41, fim: 60, centavosPorPonto: 50 },
  { inicio: 61, fim: 75, centavosPorPonto: 200 },
  { inicio: 76, fim: 99, centavosPorPonto: 600 },
];
const IDADE_MAXIMA_DA_JOVEM_PROMESSA = 21;
const PISO_DO_VALOR_BASE = 100;

export interface DadosValorBase {
  overall: number;
  potencial: number;
  idadeNoCadastro: number;
}

function contarPontosNaFaixa(overall: number, inicio: number, fim: number): number {
  return Math.max(0, Math.min(overall, fim) - (inicio - 1));
}

// RN06: parte progressiva do overall, × (100 + potencial − overall) ÷ 100 até 21 anos, um arredondamento e piso de 1,00; em centavos, só no cadastro
export function calcularValorBase({ overall, potencial, idadeNoCadastro }: DadosValorBase): number {
  const parteDoOverall = FAIXAS_DO_OVERALL.reduce((total, faixa) => total + faixa.centavosPorPonto * contarPontosNaFaixa(overall, faixa.inicio, faixa.fim), 0);
  const valor = idadeNoCadastro <= IDADE_MAXIMA_DA_JOVEM_PROMESSA ? arredondarMeioLongeDoZero(parteDoOverall * (100 + potencial - overall), 100) : parteDoOverall;
  return Math.max(valor, PISO_DO_VALOR_BASE);
}
