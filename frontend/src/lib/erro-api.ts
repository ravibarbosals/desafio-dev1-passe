import { isAxiosError } from "axios";

// Corpo de erro da API (DEC-035); a tela usa só o message
export interface CorpoErroApi {
  message: string;
  error: string;
  statusCode: number;
  codigoRegra: string;
  timestamp: string;
  path: string;
  detalhes?: { campo: string; mensagem: string }[];
}

export const mensagemSemConexao = "Não foi possível conectar ao servidor.";
export const mensagemErroPadrao = "Não foi possível concluir a operação.";

export function extrairMensagemErro(erro: unknown): string {
  if (!isAxiosError<Partial<CorpoErroApi>>(erro)) {
    return mensagemErroPadrao;
  }
  if (!erro.response) {
    return mensagemSemConexao;
  }
  const mensagem = erro.response.data?.message;
  return typeof mensagem === "string" && mensagem.trim() !== "" ? mensagem : mensagemErroPadrao;
}

// 404 da API: a tela mostra "não encontrado" com o caminho de volta (E04), em vez do erro genérico
export function ehNaoEncontrado(erro: unknown): boolean {
  return isAxiosError(erro) && erro.response?.status === 404;
}

// Sem resposta do servidor (rede): a tela diz que a ação não foi confirmada e deixa tentar de novo (M03)
export function semResposta(erro: unknown): boolean {
  return isAxiosError(erro) && !erro.response;
}

// A API respondeu e recusou o pedido (4xx): a tela mostra o message no lugar, sem "Tentar de novo" (H05)
export function recusadoPelaApi(erro: unknown): boolean {
  return isAxiosError(erro) && erro.response !== undefined && erro.response.status < 500;
}
