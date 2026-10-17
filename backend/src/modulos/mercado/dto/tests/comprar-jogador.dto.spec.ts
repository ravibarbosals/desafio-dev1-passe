import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { ComprarJogadorDto } from '@/modulos/mercado/dto/comprar-jogador.dto';

function validar(corpo: object): Promise<ComprarJogadorDto> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: ComprarJogadorDto }) as Promise<ComprarJogadorDto>;
}

async function listarCamposRecusados(corpo: object): Promise<string[]> {
  const erro = await validar(corpo).catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return (erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo) ?? [];
}

const corpoValido = { club_id: 1, loyalty_until: '2027-03-02T10:15-03:00' };

describe('ComprarJogadorDto', () => {
  it('aceita o corpo do exemplo 2.3.1, entrega a fidelidade como instante e descarta campos extras (V7)', async () => {
    await expect(validar({ ...corpoValido, value: 1 })).resolves.toEqual({ club_id: 1, loyalty_until: new Date('2027-03-02T13:15:00Z') });
  });

  it.each([
    ['ausente', undefined],
    ['zero', 0],
    ['negativo', -1],
    ['texto', '1'],
    ['fracionário', 1.5],
    ['acima do maior INTEGER', 2_147_483_648],
  ])('recusa club_id %s', async (_caso, club_id) => {
    await expect(listarCamposRecusados({ ...corpoValido, club_id })).resolves.toEqual(['club_id']);
  });

  // RN01 e 3.2 do guia: o prazo (passado, além de 1.095 dias) é do service
  it.each([
    ['ausente', undefined],
    ['sem o offset', '2027-03-02T10:15'],
    ['com segundos', '2027-03-02T10:15:00-03:00'],
    ['em UTC', '2027-03-02T13:15Z'],
    ['com data inexistente', '2027-02-30T10:15-03:00'],
    ['número', 1],
  ])('recusa loyalty_until %s', async (_caso, loyalty_until) => {
    await expect(listarCamposRecusados({ ...corpoValido, loyalty_until })).resolves.toEqual(['loyalty_until']);
  });
});
