import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { CriarClubeDto } from '@/modulos/clubes/dto/criar-clube.dto';

function validar(corpo: object): Promise<CriarClubeDto> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: CriarClubeDto }) as Promise<CriarClubeDto>;
}

async function listarCamposRecusados(corpo: object): Promise<string[]> {
  const erro = await validar(corpo).catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return [...new Set((erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo))];
}

describe('CriarClubeDto', () => {
  it('aceita o corpo do exemplo e descarta campos extras (V7)', async () => {
    await expect(validar({ name: 'Águias FC', acronym: 'AGU', cash: 999, formation: '2-2' })).resolves.toEqual({ name: 'Águias FC', acronym: 'AGU' });
  });

  it('normaliza o nome antes de validar e de comparar com a sigla (V4)', async () => {
    await expect(validar({ name: '  Leões   da Serra ', acronym: 'LDS' })).resolves.toEqual({ name: 'Leões da Serra', acronym: 'LDS' });
  });

  // Tabela de regras-negocio/clubes.md (Limites dos campos do clube)
  it.each([
    ['Águias FC', 'AFC'],
    ['São Paulo', 'SPL'],
    ['F.C. Recife', 'FCR'],
    ['Santa Cruz-PE', 'SCP'],
    ['Um Dois Tres Quatro Cinco', 'UDT'],
    ['Ré Clube', 'REC'],
  ])('aceita %j com a sigla %s', async (name, acronym) => {
    await expect(validar({ name, acronym })).resolves.toBeInstanceOf(CriarClubeDto);
  });

  it.each([
    ['dígito', 'Clube 1'],
    ['dígito colado na palavra', 'Clube1 Recife'],
    ['6 palavras', 'A B C D E F'],
    ['1 palavra', 'Águias'],
    ['pedaço sem letra (AM-002)', 'Águias - FC'],
    ['caractere fora da lista', 'Águias FC!'],
    ['acima de 60 caracteres', `Clube ${'a'.repeat(55)}`],
  ])('recusa nome com %s', async (_caso, name) => {
    await expect(listarCamposRecusados({ name, acronym: 'CLU' })).resolves.toContain('name');
  });

  it.each([
    ['não começa pela 1ª letra do nome', 'GUA'],
    ['fora de ordem', 'ACF'],
    ['todas iguais', 'AAA'],
    ['minúsculas', 'agu'],
    ['duas letras', 'AG'],
    ['com acento', 'ÁGU'],
    ['ausente', undefined],
  ])('recusa sigla %s', async (_caso, acronym) => {
    await expect(listarCamposRecusados({ name: 'Águias FC', acronym })).resolves.toEqual(['acronym']);
  });

  it('recusa sigla de letras iguais mesmo quando o nome as tem (Ana Ama Alma)', async () => {
    await expect(listarCamposRecusados({ name: 'Ana Ama Alma', acronym: 'AAA' })).resolves.toEqual(['acronym']);
  });

  it('sigla fora do formato recebe só a mensagem do formato, mesmo sem combinar com o nome', async () => {
    const erro = await validar({ name: 'Águias FC', acronym: 'gua' }).catch((excecao: unknown) => excecao);
    expect((erro as RegraNegocioException).detalhes).toEqual([{ campo: 'acronym', mensagem: 'acronym deve ter exatamente três letras maiúsculas de A a Z.' }]);
  });
});
