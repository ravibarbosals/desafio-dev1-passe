import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

// Consulta que falhou é repetida uma vez só sem resposta (rede) ou com 5xx; um 4xx (404, 400) é a
// resposta definitiva da API, e repetir só atrasa a tela de "não encontrado" (E04)
export function deveRepetirConsulta(falhas: number, erro: unknown): boolean {
  if (falhas >= 1) {
    return false;
  }
  const status = isAxiosError(erro) ? erro.response?.status : undefined;
  return status === undefined || status >= 500;
}

export function criarClienteQuery(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: deveRepetirConsulta, refetchOnWindowFocus: false },
      // DEC-007: envio que falhou não é repetido sozinho (um POST repetido pode duplicar o registro)
      mutations: { retry: 0 },
    },
  });
}
