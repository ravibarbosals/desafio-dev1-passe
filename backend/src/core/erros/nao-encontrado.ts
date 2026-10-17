import { HttpStatus } from '@nestjs/common';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';

// Catálogo (regras-negocio/README.md, DEC-032): id inexistente, fora do formato (V8) ou de jogador excluído (RN09) → 404
export const RECURSOS_NAO_ENCONTRADOS = {
  jogador: { codigo: 'JOGADOR_NAO_ENCONTRADO', mensagem: 'Jogador não encontrado.' },
  clube: { codigo: 'CLUBE_NAO_ENCONTRADO', mensagem: 'Clube não encontrado.' },
  partida: { codigo: 'PARTIDA_NAO_ENCONTRADA', mensagem: 'Partida não encontrada.' },
} as const;

export type RecursoNaoEncontrado = keyof typeof RECURSOS_NAO_ENCONTRADOS;

export function criarErroNaoEncontrado(recurso: RecursoNaoEncontrado): RegraNegocioException {
  const { codigo, mensagem } = RECURSOS_NAO_ENCONTRADOS[recurso];
  return new RegraNegocioException(mensagem, codigo, HttpStatus.NOT_FOUND);
}
