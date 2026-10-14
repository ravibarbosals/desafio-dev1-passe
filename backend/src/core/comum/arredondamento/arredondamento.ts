// DEC-037: cada cálculo é uma fração de inteiros (centavos, ‰) arredondada uma única vez, sem ponto flutuante

function dividirComResto(numerador: number, denominador: number): { quociente: number; resto: number; negativo: boolean } {
  if (!Number.isSafeInteger(numerador) || !Number.isSafeInteger(denominador) || denominador === 0) {
    throw new RangeError(`Fração inválida: ${numerador}/${denominador}`);
  }
  const absNumerador = Math.abs(numerador);
  const absDenominador = Math.abs(denominador);
  const quociente = Math.floor(absNumerador / absDenominador);
  return { quociente, resto: absNumerador - quociente * absDenominador, negativo: numerador < 0 !== denominador < 0 };
}

// Meio vai para longe do zero: 14,775 → 14,78 e −0,385 → −0,39 (E Premissas, Arredondamento)
export function arredondarMeioLongeDoZero(numerador: number, denominador: number): number {
  const { quociente, resto, negativo } = dividirComResto(numerador, denominador);
  const absoluto = 2 * resto >= Math.abs(denominador) ? quociente + 1 : quociente;
  return negativo && absoluto !== 0 ? -absoluto : absoluto;
}

// Meio vai para cima: overall (RN06) e efeito da condição na partida (RN20)
export function arredondarMeioParaCima(numerador: number, denominador: number): number {
  const { quociente, resto, negativo } = dividirComResto(numerador, denominador);
  const metadeOuMais = 2 * resto >= Math.abs(denominador);
  if (!negativo) {
    return metadeOuMais ? quociente + 1 : quociente;
  }
  // Negativo: o meio exato sobe (fica mais perto do zero)
  const absoluto = 2 * resto > Math.abs(denominador) ? quociente + 1 : quociente;
  return absoluto === 0 ? 0 : -absoluto;
}
