import type { ReactNode } from "react";

import { Label } from "@/componentes/ui/label";

interface PropriedadesCampoFormulario {
  // O mesmo id do campo, para o rótulo apontar para ele
  id: string;
  rotulo: string;
  // Mensagem da validação local (zod), mostrada junto ao campo (REQ-044)
  erro?: string;
  children: ReactNode;
}

export function CampoFormulario({ id, rotulo, erro, children }: PropriedadesCampoFormulario) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
