import { QueryClient } from "@tanstack/react-query";

export function criarClienteQuery(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false },
      // DEC-007: envio que falhou não é repetido sozinho (um POST repetido pode duplicar o registro)
      mutations: { retry: 0 },
    },
  });
}
