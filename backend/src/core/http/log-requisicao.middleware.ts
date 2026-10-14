import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

// Diferencial "Registro de logs" (B5): uma linha por requisição; o Logger do Nest já põe a data e a hora
export function logRequisicaoMiddleware(req: Request, res: Response, next: NextFunction): void {
  const inicio = performance.now();
  res.on('finish', () => {
    const duracao = Math.round(performance.now() - inicio);
    logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duracao}ms`);
  });
  next();
}
