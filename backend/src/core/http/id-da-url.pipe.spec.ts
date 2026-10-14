import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { IdDaUrlPipe } from '@/core/http/id-da-url.pipe';

const pipe = new IdDaUrlPipe('JOGADOR_NAO_ENCONTRADO', 'Jogador não encontrado.');

function capturarErro(valor: string): unknown {
  try {
    pipe.transform(valor);
  } catch (erro) {
    return erro;
  }
  return undefined;
}

describe('IdDaUrlPipe', () => {
  it.each([
    ['1', 1],
    ['42', 42],
    ['2147483647', 2147483647],
  ])('aceita %s', (valor, esperado) => {
    expect(pipe.transform(valor)).toBe(esperado);
  });

  it.each(['abc', '0', '-1', '1.5', '01', '2147483648', '1e3', ' 1', ''])('responde 404 com o código do recurso para %j (V8)', (valor) => {
    const erro = capturarErro(valor);

    expect(erro).toBeInstanceOf(RegraNegocioException);
    expect(erro).toMatchObject({ codigo: 'JOGADOR_NAO_ENCONTRADO', message: 'Jogador não encontrado.' });
    expect((erro as RegraNegocioException).getStatus()).toBe(404);
  });
});
