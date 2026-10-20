import { CircleAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tons = {
  atencao: { classes: "border-amber-200 bg-amber-50 text-amber-800", Icone: TriangleAlert },
  erro: { classes: "border-red-200 bg-red-50 text-red-700", Icone: CircleAlert },
};

interface PropriedadesAlerta {
  // atencao: aviso que não impede (titular, mal condicionado); erro: recusa da API
  tom: keyof typeof tons;
  titulo: string;
  children: ReactNode;
}

// Quadro de aviso dentro de modais e abas (J16, V01, M04, H05, C07, C10)
export function Alerta({ tom, titulo, children }: PropriedadesAlerta) {
  const { classes, Icone } = tons[tom];

  return (
    <div role="alert" className={cn("flex gap-2 rounded-lg border p-3 text-sm", classes)}>
      <Icone className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">{titulo}</p>
        {children}
      </div>
    </div>
  );
}
