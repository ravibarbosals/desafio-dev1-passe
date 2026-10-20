import type { ReactNode } from "react";

import type { LadoDaPartida, ResumoDaPartida } from "@/api/partidas";
import { Badge } from "@/componentes/ui/badge";
import { formatarDataHora } from "@/lib/formatacao";
import { nomesDosResultados } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

interface PropriedadesLado {
  lado: LadoDaPartida;
  papel: "Mandante" | "Visitante";
}

function Lado({ lado, papel }: PropriedadesLado) {
  return (
    <div className={cn("flex-1", papel === "Mandante" && "text-right")}>
      <p className="font-semibold">{lado.club_name}</p>
      <p className="text-xs text-muted-foreground">
        {papel} · {lado.formation}
      </p>
    </div>
  );
}

interface PropriedadesPlacar {
  partida: ResumoDaPartida;
  // Ex.: "Ver duelos" na última partida (L01)
  acao?: ReactNode;
}

// Mandante, placar e visitante, como a API gravou (L01, L03)
export function Placar({ partida, acao }: PropriedadesPlacar) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
      <div className="flex flex-1 items-center gap-4">
        <Lado lado={partida.home} papel="Mandante" />
        <div className="flex flex-col items-center gap-1">
          <p className="rounded-lg bg-muted px-3 py-1 text-2xl font-semibold">
            {partida.home.goals} × {partida.away.goals}
          </p>
          <p className="text-xs text-muted-foreground">{formatarDataHora(partida.played_at)}</p>
          <Badge variant="outline">{nomesDosResultados[partida.result]}</Badge>
        </div>
        <Lado lado={partida.away} papel="Visitante" />
      </div>
      {acao}
    </div>
  );
}
