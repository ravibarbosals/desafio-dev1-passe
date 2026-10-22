import { HttpStatus, ValidationError } from '@nestjs/common';
import { DetalheErro, RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { traduzirCampoDaMensagem } from '../validacao/nomes-dos-campos';

function listarDetalhes(erros: ValidationError[], caminhoPai = ''): DetalheErro[] {
  return erros.flatMap((erro) => {
    const campo = caminhoPai ? `${caminhoPai}.${erro.property}` : erro.property;
    const proprios = Object.values(erro.constraints ?? {}).map((mensagem) => ({ campo, mensagem: traduzirCampoDaMensagem(mensagem) }));
    return [...proprios, ...listarDetalhes(erro.children ?? [], campo)];
  });
}

// DEC-035: a lista do ValidationPipe vira uma frase no message e vai inteira em detalhes
export function criarErroValidacao(erros: ValidationError[]): RegraNegocioException {
  const detalhes = listarDetalhes(erros);
  const mensagem = `Dados inválidos: ${detalhes.map((detalhe) => detalhe.mensagem).join(' ')}`;
  return new RegraNegocioException(mensagem, 'DADOS_INVALIDOS', HttpStatus.BAD_REQUEST, detalhes);
}
