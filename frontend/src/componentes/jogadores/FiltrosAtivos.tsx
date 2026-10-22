import { X } from "lucide-react";

import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";

import type { FiltroAtivo } from "./filtros-ativos";

interface PropriedadesFiltrosAtivos {
  // "Filtros ativos:" (J02) ou "Resultados para a busca:" (J03)
  titulo: string;
  filtros: FiltroAtivo[];
  aoRemover: (filtro: FiltroAtivo) => void;
  aoLimparTodos: () => void;
}

export function FiltrosAtivos({
  titulo,
  filtros,
  aoRemover,
  aoLimparTodos,
}: PropriedadesFiltrosAtivos) {
  if (filtros.length === 0) {
    return null;
  }
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">{titulo}</span>
      {filtros.map((filtro) => (
        <Badge key={filtro.rotulo} variant="outline" className="gap-1 pr-1">
          {filtro.rotulo}
          <button
            type="button"
            aria-label={`Remover ${filtro.rotulo}`}
            className="rounded-sm hover:bg-muted-foreground/20"
            onClick={() => aoRemover(filtro)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Button type="button" variant="link" size="sm" onClick={aoLimparTodos}>
        Limpar filtros
      </Button>
    </div>
  );
}
