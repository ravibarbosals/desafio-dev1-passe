import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { Cabecalho } from "@/componentes/layout/Cabecalho";
import { MenuLateral } from "@/componentes/layout/MenuLateral";
import { PaginaErro } from "@/componentes/PaginaErro";
import { PaginaNaoEncontrada } from "@/componentes/PaginaNaoEncontrada";
import { Toaster } from "@/componentes/ui/sonner";

export const Route = createRootRoute({
  component: LayoutRaiz,
  notFoundComponent: PaginaNaoEncontrada,
  errorComponent: PaginaErro,
});

// Menu lateral à esquerda e a página num painel com a trilha no topo, como no mockup. Abaixo de
// 768 px o menu lateral some e abre pelo botão do cabeçalho (F5)
function LayoutRaiz() {
  const caminhoAtual = useRouterState({ select: (estado) => estado.location.pathname });

  if (caminhoAtual === "/") {
    return (
      <>
        <Outlet />
        <Toaster theme="light" position="bottom-right" closeButton />
      </>
    );
  }
  return (
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      <MenuLateral />
      <div className="flex min-w-0 flex-1 flex-col p-2 md:pl-0">
        <div className="flex flex-1 flex-col rounded-xl border bg-background">
          <Cabecalho />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster theme="light" position="bottom-right" closeButton />
    </div>
  );
}
