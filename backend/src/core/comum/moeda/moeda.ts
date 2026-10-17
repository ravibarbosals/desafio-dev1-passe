const textoDecimal = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

// DEC-037: centavos inteiros no domínio; o número com 2 casas só aparece nas bordas (resposta JSON e CSV)
export function centavosParaNumero(centavos: number): number {
  return centavos / 100;
}

// Bordas de entrada: NUMERIC do banco ("41.44") e min_value/max_value da query ("12.5"), sem passar por ponto flutuante
export function decimalParaCentavos(texto: string): number {
  const partes = textoDecimal.exec(texto);
  if (!partes) {
    throw new RangeError(`Valor decimal inválido: ${texto}`);
  }
  const [, sinal, inteiros, decimais = ''] = partes;
  const centavos = Number(inteiros) * 100 + Number(decimais.padEnd(2, '0'));
  return sinal === '-' && centavos !== 0 ? -centavos : centavos;
}

// Mensagens e CSV (RN18): 2 casas e vírgula decimal; o sinal fica mesmo com a parte inteira zero (-0,39)
export function formatarCentavos(centavos: number): string {
  const sinal = centavos < 0 ? '-' : '';
  const absoluto = Math.abs(centavos);
  return `${sinal}${Math.trunc(absoluto / 100)},${String(absoluto % 100).padStart(2, '0')}`;
}
