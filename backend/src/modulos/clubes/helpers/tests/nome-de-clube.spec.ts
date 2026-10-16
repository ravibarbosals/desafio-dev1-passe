import { normalizarNomeDeClube, siglaCombinaComNome } from '@/modulos/clubes/helpers/nome-de-clube';

describe('normalizarNomeDeClube', () => {
  // Casos da RN10: só minúsculas e V4; o acento continua
  it.each([
    ['Águias FC', 'águias fc'],
    ['  águias   fc ', 'águias fc'],
    ['Aguias FC', 'aguias fc'],
    ['Leões da Serra', 'leões da serra'],
  ])('%j → %j', (nome, esperado) => {
    expect(normalizarNomeDeClube(nome)).toBe(esperado);
  });

  it('dá a mesma chave para o "Á" composto e para "A" + acento separado (PR-010)', () => {
    const decomposto = 'Águias FC'.normalize('NFD');
    expect(decomposto).not.toBe('Águias FC');
    expect(normalizarNomeDeClube(decomposto)).toBe('águias fc');
  });
});

describe('siglaCombinaComNome', () => {
  // Tabela de regras-negocio/clubes.md (Limites dos campos do clube)
  it.each([
    ['AGU', 'Águias FC'],
    ['AFC', 'Águias FC'],
    ['LDS', 'Leões da Serra'],
    ['SPL', 'São Paulo'],
    ['FCR', 'F.C. Recife'],
    ['AGU', 'Águias FC'.normalize('NFD')],
    ['AAS', 'Águias FC'],
    // Hífen e ponto não são letras: a 1ª letra do nome é o "A"
    ['AGU', '-Águias FC'],
  ])('aceita %s para %j', (sigla, nome) => {
    expect(siglaCombinaComNome(sigla, nome)).toBe(true);
  });

  it.each([
    ['GUA', 'Águias FC', 'não começa pela 1ª letra do nome'],
    ['ACF', 'Águias FC', 'fora de ordem'],
    ['AAA', 'Águias FC', 'o nome só tem dois "a"'],
    ['AGX', 'Águias FC', 'letra que não está no nome'],
    ['LDD', 'Leões da Serra', 'a mesma letra do nome não serve duas vezes'],
    ['', 'Águias FC', 'sigla vazia'],
  ])('recusa %j para %j (%s)', (sigla, nome) => {
    expect(siglaCombinaComNome(sigla, nome)).toBe(false);
  });
});
