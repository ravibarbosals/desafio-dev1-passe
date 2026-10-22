import { useQuery } from "@tanstack/react-query";
import { Clock, Swords, Trophy, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { consultaDosClubes } from "@/api/clube";
import { consultaDosJogadores } from "@/api/jogadores";
import { consultaDasPartidas } from "@/api/partidas";

interface PropriedadesLinha {
  icone: LucideIcon;
  titulo: string;
  children: ReactNode;
}

// J01 e demais telas: o resumo da liga no pé do menu, com as consultas que as telas já usam
// (DEC-070); enquanto carregam, os números ficam como "–"
export function RodapeDaLiga() {
  const clubes = useQuery(consultaDosClubes());
  const jogadores = useQuery(consultaDosJogadores({}));
  const partidas = useQuery(consultaDasPartidas());
  const ultima = partidas.data?.[0];

  return (
    <div className="mt-auto flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-xl border bg-background p-3">
        <Linha icone={Trophy} titulo="Liga Fictícia 2026">
          {clubes.data?.length ?? "–"} clubes · {jogadores.data?.meta.total_items ?? "–"} jogadores
        </Linha>
        <Linha icone={Swords} titulo="Última partida">
          {ultima
            ? `${ultima.home.club_name} ${ultima.home.goals} × ${ultima.away.goals} ${ultima.away.club_name}`
            : partidas.data
              ? "nenhuma ainda"
              : "–"}
        </Linha>
      </div>
      <p className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        Horário de Brasília (UTC−3)
      </p>
    </div>
  );
}

function Linha({ icone: Icone, titulo, children }: PropriedadesLinha) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icone className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{titulo}</p>
        <p className="truncate text-xs text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
