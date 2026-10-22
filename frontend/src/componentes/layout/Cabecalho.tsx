import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, RefreshCw } from "lucide-react";

import { consultaDoClube } from "@/api/clube";
import { consultaDaPartida } from "@/api/partidas";
import { Button } from "@/componentes/ui/button";

import { MenuMovel } from "./MenuMovel";
import { encontrarItemAtivo, encontrarPaginaInterna } from "./navegacao";

export function Cabecalho() {
  const caminhoAtual = useRouterState({ select: (estado) => estado.location.pathname });
  const ativo = encontrarItemAtivo(caminhoAtual);
  const interna = useNomeDaPaginaInterna(caminhoAtual);
  const clienteQuery = useQueryClient();

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4 md:px-6">
      <MenuMovel />
      {ativo && (
        <nav
          aria-label="Trilha"
          className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
        >
          <span>{ativo.secao}</span>
          <ChevronRight className="size-4 shrink-0" />
          {/* C04, L03: dentro de um clube ou de uma partida, o item volta para a lista */}
          {interna ? (
            <>
              <Link to={ativo.item.caminho} className="hover:text-foreground hover:underline">
                {ativo.item.rotulo}
              </Link>
              <ChevronRight className="size-4 shrink-0" />
              <span className="truncate text-foreground" aria-current="page">
                {interna}
              </span>
            </>
          ) : (
            <span className="text-foreground" aria-current="page">
              {ativo.item.rotulo}
            </span>
          )}
        </nav>
      )}
      {/* Busca de novo tudo o que está na tela, sem recarregar a página */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Recarregar dados"
        className="ml-auto"
        onClick={() => void clienteQuery.invalidateQueries()}
      >
        <RefreshCw />
      </Button>
    </header>
  );
}

// O terceiro nível da trilha: o nome do clube ou o placar da partida, das mesmas consultas da
// página (já em cache); enquanto carrega ou se não existir, "Clube 99" (E04) ou "Partida 3"
function useNomeDaPaginaInterna(caminho: string): string | undefined {
  const pagina = encontrarPaginaInterna(caminho);
  const clube = useQuery({
    ...consultaDoClube(Number(pagina?.id)),
    enabled: pagina?.tipo === "clube",
  });
  const partida = useQuery({
    ...consultaDaPartida(Number(pagina?.id)),
    enabled: pagina?.tipo === "partida",
  });

  if (pagina?.tipo === "clube") {
    return clube.data?.name ?? `Clube ${pagina.id}`;
  }
  if (pagina?.tipo === "partida") {
    if (!partida.data) {
      return `Partida ${pagina.id}`;
    }
    const { home, away } = partida.data;
    return `${home.club_name} ${home.goals} × ${away.goals} ${away.club_name}`;
  }
  return undefined;
}
