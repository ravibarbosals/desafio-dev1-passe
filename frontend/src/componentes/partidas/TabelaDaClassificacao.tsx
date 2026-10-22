import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import type { ReactNode } from "react";

import type { LinhaDaClassificacao } from "@/api/partidas";
import { TabelaComEstados, type ColunaDaTabela } from "@/componentes/tabela/TabelaComEstados";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { useSiglasDosClubes } from "@/hooks/useSiglasDosClubes";
import { formatarInteiroComSinal } from "@/lib/formatacao";

interface PropriedadesTabelaDaClassificacao {
  consulta: UseQueryResult<LinhaDaClassificacao[]>;
}

// Clube sem partidas com os números apagados (L05)
function numero(linha: LinhaDaClassificacao, valor: ReactNode): ReactNode {
  return linha.played === 0 ? <span className="text-muted-foreground">{valor}</span> : valor;
}

// Números da API, sem recalcular (REQ-043); o líder com a posição em destaque (L05)
function montarColunas(siglas: Map<number, string>): ColunaDaTabela<LinhaDaClassificacao>[] {
  return [
    {
      titulo: "#",
      celula: (linha) => (
        <Badge variant={linha.position === 1 ? "default" : "outline"}>{linha.position}</Badge>
      ),
    },
    {
      titulo: "Clube",
      celula: (linha) => (
        <span className="flex items-center gap-2">
          <Badge variant="outline">{siglas.get(linha.club_id)}</Badge>
          <Link
            to="/clubes/$id"
            params={{ id: String(linha.club_id) }}
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            {linha.club_name}
          </Link>
        </span>
      ),
    },
    { titulo: "J", celula: (linha) => numero(linha, linha.played), alinharADireita: true },
    { titulo: "V", celula: (linha) => numero(linha, linha.wins), alinharADireita: true },
    { titulo: "E", celula: (linha) => numero(linha, linha.draws), alinharADireita: true },
    { titulo: "D", celula: (linha) => numero(linha, linha.losses), alinharADireita: true },
    { titulo: "GP", celula: (linha) => numero(linha, linha.goals_for), alinharADireita: true },
    { titulo: "GC", celula: (linha) => numero(linha, linha.goals_against), alinharADireita: true },
    {
      titulo: "SG",
      celula: (linha) => numero(linha, formatarInteiroComSinal(linha.goal_difference)),
      alinharADireita: true,
    },
    {
      titulo: "Pts",
      celula: (linha) => <span className="font-semibold">{linha.points}</span>,
      alinharADireita: true,
    },
  ];
}

// F14: todos os clubes na ordem de GET /standings, inclusive os sem partidas (zerados)
export function TabelaDaClassificacao({ consulta }: PropriedadesTabelaDaClassificacao) {
  const siglas = useSiglasDosClubes();

  return (
    <TabelaComEstados
      colunas={montarColunas(siglas)}
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
