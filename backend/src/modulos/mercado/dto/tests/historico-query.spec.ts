import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { HistoricoQueryDto } from '@/modulos/mercado/dto/historico-query.dto';

function validar(query: object): Promise<HistoricoQueryDto> {
  return criarValidationPipe().transform(query, { type: 'query', metatype: HistoricoQueryDto }) as Promise<HistoricoQueryDto>;
}

describe('HistoricoQueryDto', () => {
  it('sem filtros', async () => {
    await expect(validar({})).resolves.toEqual({});
  });

  it.each([
    ['VENDA', ['VENDA']],
    ['COMPRA,VENDA', ['COMPRA', 'VENDA']],
    ['VENDA,COMPRA', ['VENDA', 'COMPRA']],
  ])('aceita type=%s', async (type, esperado) => {
    await expect(validar({ type })).resolves.toEqual({ type: esperado });
  });

  it('aceita player_id e entrega número', async () => {
    await expect(validar({ type: 'VENDA', player_id: '2' })).resolves.toEqual({ type: ['VENDA'], player_id: 2 });
  });

  it.each([
    ['type vazio', { type: '' }, 'type'],
    ['type repetido na lista', { type: 'COMPRA,COMPRA' }, 'type'],
    ['type com espaço', { type: 'COMPRA, VENDA' }, 'type'],
    ['type em minúsculas (V5)', { type: 'venda' }, 'type'],
    ['type fora da lista', { type: 'TROCA' }, 'type'],
    ['type como parâmetro repetido', { type: ['COMPRA', 'VENDA'] }, 'type'],
    ['player_id zero', { player_id: '0' }, 'player_id'],
    ['player_id com zero à esquerda', { player_id: '02' }, 'player_id'],
    ['player_id texto', { player_id: 'abc' }, 'player_id'],
    ['player_id vazio', { player_id: '' }, 'player_id'],
  ])('recusa %s', async (_caso, query, campo) => {
    const erro = await validar(query).catch((excecao: unknown) => excecao);
    expect(erro).toBeInstanceOf(RegraNegocioException);
    expect((erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo)).toEqual([campo]);
  });
});
