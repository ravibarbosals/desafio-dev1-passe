import { ValueTransformer } from 'typeorm';
import { centavosParaNumero, decimalParaCentavos } from '@/core/comum/moeda/moeda';

// DEC-037 / ERD-002: no domínio, dinheiro em centavos inteiros; no banco, NUMERIC (o driver pg devolve texto, como "41.44")
export const transformadorCentavos: ValueTransformer = {
  to: (centavos: number | null | undefined) => (centavos === null || centavos === undefined ? centavos : centavosParaNumero(centavos)),
  from: (valor: string | null) => (valor === null ? null : decimalParaCentavos(valor)),
};
