import { chaveDeComparacao, compararNomes, contarCaracteres, contemTexto, normalizarTexto, temCaractereDeControle } from '@/core/comum/texto/texto';

// Caracteres invisíveis escritos pelo código, para o formatador e o copiar e colar não os trocarem
const acentoAgudoSeparado = String.fromCodePoint(0x0301);
const aComAcentoAgudo = String.fromCodePoint(0x00c1);
const espacoSemQuebra = String.fromCodePoint(0x00a0);

describe('normalizarTexto', () => {
  it('tira os espaços das pontas e junta os repetidos (V4)', () => {
    expect(normalizarTexto('  Meia   Zeta ')).toBe('Meia Zeta');
  });

  it('transforma texto só com espaços em vazio', () => {
    expect(normalizarTexto('   ')).toBe('');
  });

  it('converte para NFC (PR-010)', () => {
    expect(normalizarTexto(`A${acentoAgudoSeparado}guias`)).toBe(`${aComAcentoAgudo}guias`);
  });

  it('não mexe em espaços que não são U+0020', () => {
    expect(normalizarTexto(`Meia${espacoSemQuebra}Zeta`)).toBe(`Meia${espacoSemQuebra}Zeta`);
  });
});

describe('temCaractereDeControle', () => {
  it.each(['Meia\tZeta', 'Meia\nZeta', 'Meia\u0000Zeta'])('recusa %j', (texto) => {
    expect(temCaractereDeControle(texto)).toBe(true);
  });

  it('aceita letras, acentos, hífen e emoji', () => {
    expect(temCaractereDeControle('Ágape-Silva ⚽')).toBe(false);
  });
});

describe('contarCaracteres', () => {
  it('conta um por caractere, inclusive fora do BMP', () => {
    expect(contarCaracteres('Lua ⚽😀')).toBe(6);
    expect('Lua ⚽😀'.length).toBe(7);
  });
});

describe('chaveDeComparacao', () => {
  it('fica em minúsculas e sem acento', () => {
    expect(chaveDeComparacao('Épsilon João')).toBe('epsilon joao');
  });
});

describe('compararNomes', () => {
  function ordenar(nomes: string[]): string[] {
    return [...nomes].sort(compararNomes);
  }

  it('ignora acentos: Épsilon fica entre Delta e Gama', () => {
    expect(ordenar(['Gama', 'Épsilon', 'Delta'])).toEqual(['Delta', 'Épsilon', 'Gama']);
  });

  it('compara por ponto de código: espaço < hífen < letras', () => {
    expect(ordenar(['Ana-Maria', 'Ana Lima'])).toEqual(['Ana Lima', 'Ana-Maria']);
  });

  it('empata nomes que só diferem no acento e na caixa', () => {
    expect(compararNomes('Águias FC', 'aguias fc')).toBe(0);
  });

  it('coloca o prefixo antes do nome maior', () => {
    expect(compararNomes('Ana', 'Ana Lima')).toBeLessThan(0);
  });
});

describe('contemTexto', () => {
  it.each([
    ['João Silva', 'joao'],
    ['Meia Lua', 'LUA'],
  ])('%s contém %s (RN07)', (texto, busca) => {
    expect(contemTexto(texto, busca)).toBe(true);
  });

  it('não acha o que não está no texto', () => {
    expect(contemTexto('Meia Lua', 'sol')).toBe(false);
  });
});
