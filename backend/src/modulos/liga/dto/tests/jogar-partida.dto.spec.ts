import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { JogarPartidaDto } from '@/modulos/liga/dto/jogar-partida.dto';

function validar(corpo: object): Promise<JogarPartidaDto> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: JogarPartidaDto }) as Promise<JogarPartidaDto>;
}

async function listarRecusas(corpo: object): Promise<string[]> {
  const erro = await validar(corpo).catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return (erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.mensagem) ?? [];
}

const corpoValido = { home_club_id: 1, away_club_id: 2 };

describe('JogarPartidaDto', () => {
  it('aceita o corpo do exemplo 2.4.2 e descarta campos extras (V7)', async () => {
    await expect(validar({ ...corpoValido, played_at: 'agora' })).resolves.toEqual(corpoValido);
  });

  it.each([
    ['ausente', undefined],
    ['zero', 0],
    ['texto', '1'],
    ['fracionário', 1.5],
    ['acima do maior INTEGER', 2_147_483_648],
  ])('recusa home_club_id %s', async (_caso, home_club_id) => {
    await expect(listarRecusas({ ...corpoValido, home_club_id })).resolves.toEqual(['home_club_id deve ser um inteiro de 1 a 2147483647.']);
  });

  it('recusa away_club_id fora do formato', async () => {
    await expect(listarRecusas({ ...corpoValido, away_club_id: -2 })).resolves.toEqual(['away_club_id deve ser um inteiro de 1 a 2147483647.']);
  });

  it('recusa mandante igual ao visitante (RN20.1)', async () => {
    await expect(listarRecusas({ home_club_id: 1, away_club_id: 1 })).resolves.toEqual(['away_club_id deve ser diferente de home_club_id.']);
  });
});
