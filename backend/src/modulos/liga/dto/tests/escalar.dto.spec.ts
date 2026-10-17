import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { EscalarDto } from '@/modulos/liga/dto/escalar.dto';

function validar(corpo: object): Promise<EscalarDto> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: EscalarDto }) as Promise<EscalarDto>;
}

async function listarCamposRecusados(corpo: object): Promise<string[]> {
  const erro = await validar(corpo).catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return (erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo) ?? [];
}

const corpoValido = { formation: '2-1-1', player_ids: [34, 31, 30, 33, 32] };

describe('EscalarDto', () => {
  it('aceita o corpo do exemplo 2.4.1 e descarta campos extras (V7)', async () => {
    await expect(validar({ ...corpoValido, club_id: 1 })).resolves.toEqual(corpoValido);
  });

  it.each(['3-1', '2-2', '2-1-1', '1-2-1'])('aceita a formação %s', async (formation) => {
    await expect(validar({ ...corpoValido, formation })).resolves.toMatchObject({ formation });
  });

  it.each([
    ['ausente', undefined],
    ['fora da lista', '4-0'],
    ['com o goleiro', '1-2-1-1'],
    ['número', 211],
  ])('recusa formation %s', async (_caso, formation) => {
    await expect(listarCamposRecusados({ ...corpoValido, formation })).resolves.toEqual(['formation']);
  });

  it('recusa player_ids com 4 ids', async () => {
    await expect(listarCamposRecusados({ ...corpoValido, player_ids: [34, 31, 30, 33] })).resolves.toEqual(['player_ids']);
  });

  it('corpo vazio: os dois campos', async () => {
    await expect(listarCamposRecusados({})).resolves.toEqual(['formation', 'player_ids']);
  });
});
