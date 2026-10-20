import { Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PropriedadesNota {
  icone?: LucideIcon;
  children: ReactNode;
}

// Explicação curta dentro dos modais (ex.: "Taxa, custo e novo caixa são calculados ao confirmar")
export function Nota({ icone: Icone = Info, children }: PropriedadesNota) {
  return (
    <p className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
      <Icone className="size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
