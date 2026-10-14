import { ArgumentsHost, BadRequestException, HttpStatus, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { FiltroErroGlobal } from '@/core/erros/filtro-erro-global';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';

function capturar(excecao: unknown) {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl: '/api/v1/players?page=2' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  new FiltroErroGlobal().catch(excecao, host);
  return { status: status.mock.calls[0][0] as number, corpo: json.mock.calls[0][0] as Record<string, unknown> };
}

describe('FiltroErroGlobal', () => {
  it('usa o código, o status e os detalhes da RegraNegocioException', () => {
    const detalhes = [{ campo: 'agility', mensagem: 'agility deve ser um inteiro de 1 a 100.' }];
    const { status, corpo } = capturar(new RegraNegocioException('Dados inválidos.', 'DADOS_INVALIDOS', HttpStatus.BAD_REQUEST, detalhes));

    expect(status).toBe(400);
    expect(corpo).toMatchObject({ message: 'Dados inválidos.', error: 'Bad Request', statusCode: 400, codigoRegra: 'DADOS_INVALIDOS', path: '/api/v1/players', detalhes });
    expect(corpo.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/);
  });

  it('responde 409 por padrão e omite detalhes', () => {
    const { status, corpo } = capturar(new RegraNegocioException('Elenco cheio.', 'ELENCO_CHEIO'));

    expect(status).toBe(409);
    expect(corpo).toMatchObject({ error: 'Conflict', codigoRegra: 'ELENCO_CHEIO' });
    expect(corpo).not.toHaveProperty('detalhes');
  });

  it('traduz o 404 do Nest para rota não encontrada', () => {
    const { status, corpo } = capturar(new NotFoundException('Cannot GET /api/v1/nada'));

    expect(status).toBe(404);
    expect(corpo).toMatchObject({ message: 'Rota não encontrada.', codigoRegra: 'ROTA_NAO_ENCONTRADA' });
  });

  it('troca a mensagem de outro 4xx por um texto genérico', () => {
    const { status, corpo } = capturar(new BadRequestException(['a', 'b']));

    expect(status).toBe(400);
    expect(corpo).toMatchObject({ message: 'Requisição inválida.', codigoRegra: 'DADOS_INVALIDOS' });
  });

  it('responde 500 sem expor o erro e registra o stack', () => {
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const { status, corpo } = capturar(new Error('senha=123 vazou'));

    expect(status).toBe(500);
    expect(corpo).toMatchObject({ message: 'Erro interno no servidor.', error: 'Internal Server Error', codigoRegra: 'ERRO_INTERNO' });
    expect(JSON.stringify(corpo)).not.toContain('senha');
    expect(logError).toHaveBeenCalledOnce();
  });

  it('mantém o status de outro 5xx, como o 503 do healthcheck, com a mensagem genérica', () => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const { status, corpo } = capturar(new ServiceUnavailableException({ status: 'error', error: { banco: { status: 'down' } } }));

    expect(status).toBe(503);
    expect(corpo).toMatchObject({ message: 'Erro interno no servidor.', error: 'Service Unavailable', codigoRegra: 'ERRO_INTERNO' });
  });
});
