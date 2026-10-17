import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { ListarPartidasQueryDto } from '@/modulos/liga/dto/listar-partidas-query.dto';

function validar(query: object): Promise<ListarPartidasQueryDto> {
  return criarValidationPipe().transform(query, { type: 'query', metatype: ListarPartidasQueryDto }) as Promise<ListarPartidasQueryDto>;
}

describe('ListarPartidasQueryDto', () => {
  it('sem filtro', async () => {
    await expect(validar({})).resolves.toEqual({});
  });

  it('aceita club_id e entrega número; descarta parâmetros extras', async () => {
    await expect(validar({ club_id: '2', page: '1' })).resolves.toEqual({ club_id: 2 });
  });

  it.each([
    ['vazio', ''],
    ['zero', '0'],
    ['com zero à esquerda', '02'],
    ['texto', 'abc'],
    ['acima do maior INTEGER', '2147483648'],
    ['repetido', ['1', '2']],
  ])('recusa club_id %s', async (_caso, club_id) => {
    const erro = await validar({ club_id }).catch((excecao: unknown) => excecao);
    expect(erro).toBeInstanceOf(RegraNegocioException);
    expect((erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.mensagem)).toEqual(['club_id deve ser um inteiro de 1 ou mais.']);
  });
});
