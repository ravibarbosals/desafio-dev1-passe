import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Label } from "@/componentes/ui/label";

interface PropriedadesCampoFormulario {
  // O mesmo id do campo, para o rótulo apontar para ele
  id: string;
  rotulo: string;
  // Mensagem da validação local (zod), mostrada junto ao campo (REQ-044)
  erro?: string;
  // Regra do campo abaixo dele (ex.: "De 16 a 45 anos."); o erro toma o lugar dela
  ajuda?: string;
  children: ReactNode;
}

export function CampoFormulario({
  id,
  rotulo,
  erro,
  ajuda,
  children,
}: PropriedadesCampoFormulario) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="flex gap-1 text-xs text-destructive">
          <CircleAlert className="mt-px size-3.5 shrink-0" />
          {erro}
        </p>
      ) : (
        ajuda && <p className="text-xs text-muted-foreground">{ajuda}</p>
      )}
    </div>
  );
}
