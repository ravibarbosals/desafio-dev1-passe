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
