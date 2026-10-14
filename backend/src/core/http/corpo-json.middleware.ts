import { BadRequestException } from '@nestjs/common';
import { json, NextFunction, Request, Response } from 'express';

const metodosComCorpo = new Set(['POST', 'PUT', 'PATCH']);

// A venda é um POST sem corpo: o corpo enviado é ignorado, não validado (AM-005)
const rotaVenda = /^\/api\/v1\/players\/[^/]+\/sell\/?$/;

const lerJson = json();

export function rotaTemCorpo(metodo: string, caminho: string): boolean {
  return metodosComCorpo.has(metodo) && !rotaVenda.test(caminho);
}

function ehObjetoSimples(valor: unknown): boolean {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

export function corpoJsonMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!rotaTemCorpo(req.method, req.path)) {
    next();
    return;
  }
  lerJson(req, res, (erro?: unknown) => {
    if (erro !== undefined || !ehObjetoSimples(req.body)) {
      next(new BadRequestException('O corpo da requisição deve ser um objeto JSON.'));
      return;
    }
    next();
  });
}
