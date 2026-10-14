import { createRouter, type RouterHistory } from "@tanstack/react-router";

import { routeTree } from "../routeTree.gen";

// O histórico é opcional para os testes usarem createMemoryHistory
export function criarRoteador(historico?: RouterHistory) {
  return createRouter({ routeTree, history: historico });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof criarRoteador>;
  }
}
