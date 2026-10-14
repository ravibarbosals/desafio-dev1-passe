import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { formatarDataHora } from '@/core/comum/data-hora/data-hora';
import { DetalheErro, RegraNegocioException } from '@/core/erros/regra-negocio.exception';

interface ErroResolvido {
  status: number;
  mensagem: string;
  codigo: string;
  detalhes?: DetalheErro[];
}

function resolverErro(excecao: unknown): ErroResolvido {
  if (excecao instanceof RegraNegocioException) {
    return { status: excecao.getStatus(), mensagem: excecao.message, codigo: excecao.codigo, detalhes: excecao.detalhes };
  }
  if (excecao instanceof HttpException && excecao.getStatus() === HttpStatus.NOT_FOUND) {
    return { status: HttpStatus.NOT_FOUND, mensagem: 'Rota não encontrada.', codigo: 'ROTA_NAO_ENCONTRADA' };
  }
  if (excecao instanceof HttpException && excecao.getStatus() < HttpStatus.INTERNAL_SERVER_ERROR) {
    return { status: excecao.getStatus(), mensagem: 'Requisição inválida.', codigo: 'DADOS_INVALIDOS' };
  }
  const status = excecao instanceof HttpException ? excecao.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  return { status, mensagem: 'Erro interno no servidor.', codigo: 'ERRO_INTERNO' };
}

// DEC-035: todo erro sai em JSON com message texto, sem stack trace
@Catch()
export class FiltroErroGlobal implements ExceptionFilter {
  private readonly logger = new Logger(FiltroErroGlobal.name);

  catch(excecao: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const requisicao = contexto.getRequest<Request>();
    const resposta = contexto.getResponse<Response>();
    const erro = resolverErro(excecao);

    if (erro.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(excecao instanceof Error ? excecao.stack : String(excecao));
    }

    resposta.status(erro.status).json({
      message: erro.mensagem,
      error: STATUS_CODES[erro.status],
      statusCode: erro.status,
      codigoRegra: erro.codigo,
      timestamp: formatarDataHora(new Date()),
      path: requisicao.originalUrl.split('?')[0],
      ...(erro.detalhes ? { detalhes: erro.detalhes } : {}),
    });
  }
}
