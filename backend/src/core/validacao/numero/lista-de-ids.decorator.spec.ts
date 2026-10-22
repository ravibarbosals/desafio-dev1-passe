import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { ListaDeIds } from '@/core/validacao/numero/lista-de-ids.decorator';

class DtoComIds {
  @ListaDeIds(5)
  player_ids!: number[];
}

function validar(corpo: object): Promise<DtoComIds> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: DtoComIds }) as Promise<DtoComIds>;
}

describe('ListaDeIds', () => {
  it('aceita 5 ids distintos em qualquer ordem, de 1 ao maior INTEGER', async () => {
    await expect(validar({ player_ids: [34, 1, 30, 2_147_483_647, 32] })).resolves.toEqual({ player_ids: [34, 1, 30, 2_147_483_647, 32] });
  });

  it.each([
    ['ausente', undefined],
    ['que não é lista', 34],
    ['com 4 ids', [1, 2, 3, 4]],
    ['com 6 ids', [1, 2, 3, 4, 5, 6]],
    ['com id repetido', [1, 2, 3, 4, 4]],
    ['com 6 ids e um repetido', [1, 2, 3, 4, 5, 5]],
    ['objeto com length', { length: 5 }],
    ['com texto', [1, 2, 3, 4, '5']],
    ['com zero', [0, 1, 2, 3, 4]],
    ['com negativo', [-1, 1, 2, 3, 4]],
    ['com fracionário', [1.5, 1, 2, 3, 4]],
    ['acima do maior INTEGER', [2_147_483_648, 1, 2, 3, 4]],
    ['com null', [null, 1, 2, 3, 4]],
  ])('recusa player_ids %s', async (_caso, player_ids) => {
    const erro = await validar({ player_ids }).catch((excecao: unknown) => excecao);
    expect(erro).toBeInstanceOf(RegraNegocioException);
    expect((erro as RegraNegocioException).detalhes).toEqual([{ campo: 'player_ids', mensagem: 'Lista de titulares deve ser uma lista de 5 ids distintos, inteiros de 1 a 2147483647.' }]);
  });
});
