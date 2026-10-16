import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { ListarClubesQueryDto } from '@/modulos/clubes/dto/listar-clubes-query.dto';

function validar(query: object): Promise<ListarClubesQueryDto> {
  return criarValidationPipe().transform(query, { type: 'query', metatype: ListarClubesQueryDto }) as Promise<ListarClubesQueryDto>;
}

describe('ListarClubesQueryDto', () => {
  it('aceita a query vazia (sort padrão no service)', async () => {
    await expect(validar({})).resolves.toEqual({});
  });

  it.each(['name', 'net_worth_asc', 'net_worth_desc'])('aceita sort=%s', async (sort) => {
    await expect(validar({ sort })).resolves.toEqual({ sort });
  });

  it.each([
    ['maiúsculas (V5)', 'NAME'],
    ['dois valores', 'name,net_worth_asc'],
    ['parâmetro repetido', ['name', 'net_worth_asc']],
    ['vazio', ''],
    ['valor do GET /players', 'value_desc'],
  ])('recusa sort %s', async (_caso, sort) => {
    await expect(validar({ sort })).rejects.toBeInstanceOf(RegraNegocioException);
  });
});
