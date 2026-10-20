import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import type { ResumoDaPartida } from "@/api/partidas";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { formatarDataHora } from "@/lib/formatacao";
import { nomesDosResultados } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

// O vencedor em negrito, como no mockup (L01)
const colunas: ColunaDaTabela<ResumoDaPartida>[] = [
  { titulo: "Data e hora", celula: (partida) => formatarDataHora(partida.played_at) },
  {
    titulo: "Mandante",
    celula: (partida) => (
      <span className={cn(partida.result === "MANDANTE" && "font-semibold")}>
        {partida.home.club_name}
      </span>
    ),
    alinharADireita: true,
  },
  {
    titulo: "Placar",
    celula: (partida) => (
      <Badge variant="secondary">
        {partida.home.goals} × {partida.away.goals}
      </Badge>
    ),
  },
  {
    titulo: "Visitante",
    celula: (partida) => (
      <span className={cn(partida.result === "VISITANTE" && "font-semibold")}>
        {partida.away.club_name}
      </span>
    ),
  },
  {
    titulo: "Resultado",
    celula: (partida) => <Badge variant="outline">{nomesDosResultados[partida.result]}</Badge>,
  },
  {
    titulo: "Duelos",
    celula: (partida) => (
      <Button asChild variant="ghost" size="sm">
        <Link to="/partidas/$id" params={{ id: String(partida.id) }}>
          Ver duelos
          <ChevronRight />
        </Link>
      </Button>
    ),
    alinharADireita: true,
  },
];

interface PropriedadesTabelaDePartidas {
  consulta: UseQueryResult<ResumoDaPartida[]>;
  // Com filtro, o vazio fala do clube; sem filtro, da liga (E06)
  filtrado: boolean;
  acaoVazio: ReactNode;
}

// F13: histórico de partidas, da mais recente para a mais antiga, na ordem da API (RN21)
export function TabelaDePartidas({ consulta, filtrado, acaoVazio }: PropriedadesTabelaDePartidas) {
  const quantidade = consulta.data?.length ?? 0;

  return (
    <TabelaComEstados
      colunas={colunas}
      linhas={consulta.data}
      chave={(partida) => partida.id}
      consulta={consulta}
      textos={{
        carregando: "Carregando partidas…",
        erro: "Não foi possível carregar as partidas",
        vazio: filtrado ? "Nenhuma partida do clube" : "Nenhuma partida jogada",
        vazioDescricao: filtrado
          ? "O clube ainda não jogou como mandante nem como visitante."
          : "Escale os 5 titulares de dois clubes e jogue a primeira partida. O resultado aparece aqui e na classificação.",
      }}
      acaoVazio={filtrado ? undefined : acaoVazio}
      rodape={
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">
          {quantidade === 1 ? "1 partida" : `${quantidade} partidas`}
        </p>
      }
    />
  );
}
