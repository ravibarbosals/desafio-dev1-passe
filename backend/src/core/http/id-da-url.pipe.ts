import { HttpStatus, PipeTransform } from '@nestjs/common';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';

const formatoDeId = /^[1-9][0-9]*$/;
const maiorIdDoBanco = 2_147_483_647;

// V8: id da URL fora do formato é tratado como inexistente (404 com o código do recurso)
export class IdDaUrlPipe implements PipeTransform<string, number> {
  constructor(
    private readonly codigo: string,
    private readonly mensagem: string,
  ) {}

  transform(valor: string): number {
    const id = Number(valor);
    if (!formatoDeId.test(valor) || id > maiorIdDoBanco) {
      throw new RegraNegocioException(this.mensagem, this.codigo, HttpStatus.NOT_FOUND);
    }
    return id;
  }
}
