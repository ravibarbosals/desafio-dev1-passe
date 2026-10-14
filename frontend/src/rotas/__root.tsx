import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

import { PaginaErro } from "@/componentes/PaginaErro";
import { PaginaNaoEncontrada } from "@/componentes/PaginaNaoEncontrada";
import { Toaster } from "@/componentes/ui/sonner";

export const Route = createRootRoute({
  component: LayoutRaiz,
  notFoundComponent: PaginaNaoEncontrada,
  errorComponent: PaginaErro,
});

// Esqueleto do layout; o menu lateral do mockup entra com as telas (TASK-045 em diante)
function LayoutRaiz() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <Link to="/" className="text-lg font-semibold">
          Passe
        </Link>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      <Toaster theme="light" position="top-right" />
    </div>
  );
}
