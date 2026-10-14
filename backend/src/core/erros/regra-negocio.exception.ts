import { HttpException, HttpStatus } from '@nestjs/common';

export interface DetalheErro {
  campo: string;
  mensagem: string;
}

// DEC-032: erro com código do catálogo (regras-negocio/README.md); 409 por padrão
export class RegraNegocioException extends HttpException {
  constructor(
    mensagem: string,
    readonly codigo: string,
    status: HttpStatus = HttpStatus.CONFLICT,
    readonly detalhes?: DetalheErro[],
  ) {
    super(mensagem, status);
  }
}
