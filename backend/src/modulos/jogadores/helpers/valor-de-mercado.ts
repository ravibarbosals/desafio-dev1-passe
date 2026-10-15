import { arredondarMeioLongeDoZero } from '@/core/comum/arredondamento/arredondamento';
import type { CondicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

// Percentuais em décimos de ponto percentual (‰), para 7,5% ser o inteiro 75 (DEC-037)
const DESCONTO_POR_CONDICAO: Record<CondicaoJogador, number> = { APTO: 0, MAL_CONDICIONADO: 150, DOENTE: 300 };
const TETO_DO_DESCONTO = -400;
const PISO_DO_VALOR_DE_MERCADO = 100;

export interface DadosValorDeMercado {
  valorBaseCentavos: number;
  condicao: CondicaoJogador;
  agilidade: number;
  idade: number;
}

// RN02 e RN03: a agilidade só mexe no desconto de quem não está APTO
function calcularDescontoPorCondicao(condicao: CondicaoJogador, agilidade: number): number {
  const desconto = DESCONTO_POR_CONDICAO[condicao];
  if (condicao === 'APTO') {
    return desconto;
  }
  if (agilidade >= 80) {
    return desconto / 2;
  }
  if (agilidade <= 30) {
    return desconto + 100;
  }
  return desconto;
}

// RN04: pela idade atual, em qualquer condição
function calcularAjustePorIdade(idade: number): number {
  if (idade <= 21) {
    return 100;
  }
  if (idade >= 32) {
    return -100;
  }
  return 0;
}

// RN05: valor base × (100% + percentual total), com teto de −40%, um arredondamento e piso de 1,00; em centavos
export function calcularValorDeMercado({ valorBaseCentavos, condicao, agilidade, idade }: DadosValorDeMercado): number {
  const percentualTotal = Math.max(calcularAjustePorIdade(idade) - calcularDescontoPorCondicao(condicao, agilidade), TETO_DO_DESCONTO);
  const valor = arredondarMeioLongeDoZero(valorBaseCentavos * (1000 + percentualTotal), 1000);
  return Math.max(valor, PISO_DO_VALOR_DE_MERCADO);
}
