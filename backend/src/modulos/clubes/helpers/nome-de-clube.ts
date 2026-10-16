import { chaveDeComparacao, normalizarTexto } from '@/core/comum/texto/texto';

const letra = /\p{L}/u;

// RN10: chave do índice único do nome; minúsculas com acento ("Águias FC" e "Aguias FC" são nomes diferentes), depois da V4 em NFC (PR-010)
export function normalizarNomeDeClube(nome: string): string {
  return normalizarTexto(nome).toLowerCase();
}

// Limites (acronym), AM-004: a 1ª letra da sigla é a 1ª letra do nome, e as letras aparecem no nome nessa ordem, sem diferenciar maiúsculas e acentos
export function siglaCombinaComNome(sigla: string, nome: string): boolean {
  const letrasDoNome = Array.from(chaveDeComparacao(nome)).filter((caractere) => letra.test(caractere));
  const letrasDaSigla = Array.from(chaveDeComparacao(sigla));
  if (letrasDaSigla[0] !== letrasDoNome[0]) {
    return false;
  }
  let inicio = 0;
  for (const letraDaSigla of letrasDaSigla) {
    inicio = letrasDoNome.indexOf(letraDaSigla, inicio) + 1;
    if (inicio === 0) {
      return false;
    }
  }
  return true;
}
