import { arredondarMeioLongeDoZero } from '@/core/comum/arredondamento/arredondamento';

const VALOR_ISENTO_DE_TAXA = 3000;
const PERCENTUAL_DA_TAXA = 5;

// RN13: 5% do valor de mercado, só quando ele passa de 30,00; em centavos (DEC-037)
export function calcularTaxaDeCompra(valorDeMercadoCentavos: number): number {
  return valorDeMercadoCentavos > VALOR_ISENTO_DE_TAXA ? arredondarMeioLongeDoZero(valorDeMercadoCentavos * PERCENTUAL_DA_TAXA, 100) : 0;
}
