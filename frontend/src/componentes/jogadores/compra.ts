import type { ResultadoDaCompra } from "@/api/mercado";

// RN13: a taxa só existe quando o valor de mercado passa de 30,00
export function explicarTaxa(compra: ResultadoDaCompra): string {
  return compra.fee > 0 ? "5% do valor, porque passa de 30,00" : "Sem taxa: valor até 30,00";
}

// F06: custo total = valor + taxa (a soma que o enunciado permite à tela), em centavos para não
// somar com erro de ponto flutuante
export function calcularCustoTotal(compra: ResultadoDaCompra): number {
  return (Math.round(compra.value * 100) + Math.round(compra.fee * 100)) / 100;
}
