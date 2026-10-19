import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/componentes/ui/button";
import { calcularIntervalo, listarPaginasVisiveis } from "@/lib/paginacao";

interface PropriedadesPaginacao {
  // O meta da API: { page, limit, total_items, total_pages }
  pagina: number;
  limite: number;
  totalItens: number;
  totalPaginas: number;
  // Ex.: "jogadores", para "Mostrando 1–10 de 23 jogadores"
  rotuloItens: string;
  aoMudarPagina: (pagina: number) => void;
}

export function Paginacao({
  pagina,
  limite,
  totalItens,
  totalPaginas,
  rotuloItens,
  aoMudarPagina,
}: PropriedadesPaginacao) {
  const { inicio, fim } = calcularIntervalo(pagina, limite, totalItens);

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between gap-4 border-t px-4 py-3 text-sm"
    >
      <p className="text-muted-foreground">
        Mostrando {inicio}–{fim} de {totalItens} {rotuloItens}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => aoMudarPagina(pagina - 1)}
        >
          <ChevronLeft />
          Anterior
        </Button>
        {listarPaginasVisiveis(pagina, totalPaginas).map((numero, indice) =>
          numero === "reticencias" ? (
            <span key={`reticencias-${indice}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={numero}
              type="button"
              variant={numero === pagina ? "outline" : "ghost"}
              size="sm"
              aria-current={numero === pagina ? "page" : undefined}
              onClick={() => aoMudarPagina(numero)}
            >
              {numero}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => aoMudarPagina(pagina + 1)}
        >
          Próxima
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
