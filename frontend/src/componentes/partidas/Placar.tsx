import type { ReactNode } from "react";

import type { LadoDaPartida, ResumoDaPartida } from "@/api/partidas";
import { Badge } from "@/componentes/ui/badge";
import { useSiglasDosClubes } from "@/hooks/useSiglasDosClubes";
import { formatarDataHora } from "@/lib/formatacao";
import { nomesDosResultados } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

interface PropriedadesPlacar {
  partida: ResumoDaPartida;
  // Ex.: "Ver duelos" na última partida (L01)
  acao?: ReactNode;
}
interface PropriedadesLado {
  lado: LadoDaPartida;
  papel: "Mandante" | "Visitante";
  sigla: string | undefined;
}

// Nome e papel do lado de fora, sigla do lado do placar (L01)
function Lado({ lado, papel, sigla }: PropriedadesLado) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-3",
        papel === "Mandante" ? "flex-row-reverse text-right" : "",
      )}
    >
      {sigla && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-xs font-semibold">
          {sigla}
        </span>
      )}
      <div>
        <p className="font-semibold">{lado.club_name}</p>
        <p className="text-xs text-muted-foreground">
          {papel} · {lado.formation}
        </p>
      </div>
    </div>
  );
}

// Mandante, placar e visitante, como a API gravou (L01, L03)
export function Placar({ partida, acao }: PropriedadesPlacar) {
  const siglas = useSiglasDosClubes();

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
      <div className="flex flex-1 items-center gap-4">
        <Lado lado={partida.home} papel="Mandante" sigla={siglas.get(partida.home.club_id)} />
        <div className="flex flex-col items-center gap-1">
          <p className="rounded-lg bg-muted px-3 py-1 text-2xl font-semibold">
            {partida.home.goals} × {partida.away.goals}
          </p>
          <p className="text-xs text-muted-foreground">{formatarDataHora(partida.played_at)}</p>
          <Badge variant="outline">{nomesDosResultados[partida.result]}</Badge>
        </div>
        <Lado lado={partida.away} papel="Visitante" sigla={siglas.get(partida.away.club_id)} />
      </div>
      {acao}
    </div>
  );
}
