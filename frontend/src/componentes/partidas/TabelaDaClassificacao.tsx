import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

import type { LinhaDaClassificacao } from "@/api/partidas";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { formatarInteiroComSinal } from "@/lib/formatacao";

// Números da API, sem recalcular (REQ-043); o líder com a posição em destaque (L05)
const colunas: ColunaDaTabela<LinhaDaClassificacao>[] = [
  {
    titulo: "#",
    celula: (linha) => (
      <Badge variant={linha.position === 1 ? "default" : "outline"}>{linha.position}</Badge>
    ),
  },
  {
    titulo: "Clube",
    celula: (linha) => (
      <Link
        to="/clubes/$id"
        params={{ id: String(linha.club_id) }}
        className="font-medium underline-offset-4 hover:underline"
      >
        {linha.club_name}
      </Link>
    ),
  },
  { titulo: "J", celula: (linha) => linha.played, alinharADireita: true },
  { titulo: "V", celula: (linha) => linha.wins, alinharADireita: true },
  { titulo: "E", celula: (linha) => linha.draws, alinharADireita: true },
  { titulo: "D", celula: (linha) => linha.losses, alinharADireita: true },
  { titulo: "GP", celula: (linha) => linha.goals_for, alinharADireita: true },
  { titulo: "GC", celula: (linha) => linha.goals_against, alinharADireita: true },
  {
    titulo: "SG",
    celula: (linha) => formatarInteiroComSinal(linha.goal_difference),
    alinharADireita: true,
  },
  {
    titulo: "Pts",
    celula: (linha) => <span className="font-semibold">{linha.points}</span>,
    alinharADireita: true,
  },
];

interface PropriedadesTabelaDaClassificacao {
  consulta: UseQueryResult<LinhaDaClassificacao[]>;
}

// F14: todos os clubes na ordem de GET /standings, inclusive os sem partidas (zerados)
export function TabelaDaClassificacao({ consulta }: PropriedadesTabelaDaClassificacao) {
  return (
    <TabelaComEstados
      colunas={colunas}
      linhas={consulta.data}
      chave={(linha) => linha.club_id}
      consulta={consulta}
      textos={{
        carregando: "Carregando classificação…",
        erro: "Não foi possível carregar a classificação",
        vazio: "Nenhum clube cadastrado",
        vazioDescricao: "A classificação lista todos os clubes, mesmo os que ainda não jogaram.",
      }}
      acaoVazio={
        <Button asChild variant="outline">
          <Link to="/clubes">
            <Shield />
            Ver clubes
          </Link>
        </Button>
      }
      rodape={
        <p className="border-t px-4 py-3 text-xs text-muted-foreground">
          J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols sofridos
          · SG: saldo de gols · Pts: pontos
        </p>
      }
    />
  );
}
