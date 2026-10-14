const caractereDeControle = /\p{Cc}/u;
const marcaDeAcento = /\p{Mn}/gu;

// V4: NFC (PR-010), sem espaços nas pontas e sem espaços repetidos (PR-002); só o espaço U+0020 conta
export function normalizarTexto(texto: string): string {
  return texto.normalize('NFC').replace(/ +/g, ' ').replace(/^ | $/g, '');
}

// V4: \t, \n e outros caracteres da categoria Unicode Cc tornam o texto inválido
export function temCaractereDeControle(texto: string): boolean {
  return caractereDeControle.test(texto);
}

// V4 define caractere como ponto de código: um emoji conta 1, e não 2 unidades UTF-16 como no .length
function pontosDeCodigo(texto: string): string[] {
  return Array.from(texto);
}

export function contarCaracteres(texto: string): number {
  return pontosDeCodigo(texto).length;
}

// Chave da ordem alfabética e da busca: minúsculas e sem acento (E Premissas)
export function chaveDeComparacao(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(marcaDeAcento, '');
}

// Ordem alfabética por ponto de código da chave; empate fica para o chamador desempatar por id
export function compararNomes(a: string, b: string): number {
  const pontosA = pontosDeCodigo(chaveDeComparacao(a));
  const pontosB = pontosDeCodigo(chaveDeComparacao(b));
  const tamanho = Math.min(pontosA.length, pontosB.length);
  for (let i = 0; i < tamanho; i++) {
    const diferenca = pontosA[i].codePointAt(0)! - pontosB[i].codePointAt(0)!;
    if (diferenca !== 0) {
      return diferenca;
    }
  }
  return pontosA.length - pontosB.length;
}

// Busca do search (RN07): "contém", comparando as chaves
export function contemTexto(texto: string, busca: string): boolean {
  return chaveDeComparacao(texto).includes(chaveDeComparacao(busca));
}
