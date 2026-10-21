import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PropriedadesTituloPagina {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  // Botão principal da página, à direita (ex.: "+ Novo jogador")
  acao?: ReactNode;
}

export function TituloPagina({ icone: Icone, titulo, descricao, acao }: PropriedadesTituloPagina) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-primary/5 text-primary">
          <Icone className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </div>
      </div>
      {acao}
    </div>
  );
}
