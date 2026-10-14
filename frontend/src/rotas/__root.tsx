import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

import { PaginaErro } from "../componentes/PaginaErro";
import { PaginaNaoEncontrada } from "../componentes/PaginaNaoEncontrada";

export const Route = createRootRoute({
  component: LayoutRaiz,
  notFoundComponent: PaginaNaoEncontrada,
  errorComponent: PaginaErro,
});

// Esqueleto do layout; o menu lateral do mockup entra com as telas (TASK-045 em diante)
function LayoutRaiz() {
  return (
    <>
      <header>
        <Link to="/">Passe</Link>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
