import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { EventEmitter } from 'node:events';
import { logRequisicaoMiddleware } from '@/core/http/log-requisicao.middleware';

describe('logRequisicaoMiddleware', () => {
  it('registra uma linha com método, caminho e status quando a resposta termina', () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const req = { method: 'POST', originalUrl: '/api/v1/players?x=1' } as Request;
    const res = Object.assign(new EventEmitter(), { statusCode: 201 }) as unknown as Response;
    const next = vi.fn();

    logRequisicaoMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(log).not.toHaveBeenCalled();

    res.emit('finish');

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toMatch(/^POST \/api\/v1\/players\?x=1 201 - \d+ms$/);
  });
});
