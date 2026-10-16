import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { AlterarCondicaoDto } from '@/modulos/jogadores/dto/alterar-condicao.dto';

function validar(corpo: object): Promise<AlterarCondicaoDto> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: AlterarCondicaoDto }) as Promise<AlterarCondicaoDto>;
}

describe('AlterarCondicaoDto', () => {
  it.each(['APTO', 'MAL_CONDICIONADO', 'DOENTE'])('aceita %s', async (condicao) => {
    await expect(validar({ condition: condicao })).resolves.toEqual({ condition: condicao });
  });

  it('descarta os outros campos (V7)', async () => {
    await expect(validar({ condition: 'DOENTE', age: 30, club_id: 3 })).resolves.toEqual({ condition: 'DOENTE' });
  });

  it.each([
    ['ausente', {}],
    ['fora da lista', { condition: 'MACHUCADO' }],
    ['em minúsculas (V5)', { condition: 'apto' }],
    ['com espaço', { condition: ' APTO' }],
    ['número', { condition: 1 }],
  ])('recusa condition %s', async (_caso, corpo) => {
    const erro = await validar(corpo).catch((excecao: unknown) => excecao);
    expect(erro).toBeInstanceOf(RegraNegocioException);
    expect((erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo)).toEqual(['condition']);
  });
});
