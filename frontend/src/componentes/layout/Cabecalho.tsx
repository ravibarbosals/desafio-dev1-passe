import { useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { encontrarItemAtivo } from "./navegacao";

export function Cabecalho() {
  const caminhoAtual = useRouterState({ select: (estado) => estado.location.pathname });
  const ativo = encontrarItemAtivo(caminhoAtual);

  return (
    <header className="flex h-14 items-center border-b px-6">
      {ativo && (
        <nav
          aria-label="Trilha"
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <span>{ativo.secao}</span>
          <ChevronRight className="size-4" />
          <span className="text-foreground">{ativo.item.rotulo}</span>
        </nav>
      )}
    </header>
  );
}
