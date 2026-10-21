import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CloudOff, RotateCw, SearchX, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { consultaDoClube, limiteDoElenco, type JogadorDoElenco } from "@/api/clube";
import { consultaDoHistorico } from "@/api/mercado";
import { Aviso } from "@/componentes/Aviso";
import { CartoesDoClube } from "@/componentes/clubes/CartoesDoClube";
import { EscalacaoDoClube } from "@/componentes/clubes/EscalacaoDoClube";
import { HistoricoDoClube } from "@/componentes/clubes/HistoricoDoClube";
import { ModalVenderJogador } from "@/componentes/clubes/ModalVenderJogador";
import { TabelaDoElenco } from "@/componentes/clubes/TabelaDoElenco";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { Skeleton } from "@/componentes/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentes/ui/tabs";
import { ehNaoEncontrado, extrairMensagemErro } from "@/lib/erro-api";

type Aba = "elenco" | "escalacao" | "historico";

// A aba fica na URL (?aba=historico): o resultado da venda leva direto ao histórico (V03)
const esquemaDaAba = z.object({
  aba: z.enum(["elenco", "escalacao", "historico"]).optional().catch(undefined),
});

export const Route = createFileRoute("/clubes/$id")({
  validateSearch: esquemaDaAba,
  component: PaginaDoClube,
});

function PaginaDoClube() {
  const { id } = Route.useParams();
  const { aba = "elenco" } = Route.useSearch();
  const navegar = Route.useNavigate();
  // Id fora do formato também volta 404 da API (V8)
  const clube = useQuery(consultaDoClube(Number(id)));
  // Só para a contagem na aba; a aba usa a mesma consulta para as opções do filtro de jogador
  const historico = useQuery(consultaDoHistorico(Number(id)));
  const [jogadorParaVender, setJogadorParaVender] = useState<JogadorDoElenco>();

  if (clube.isError) {
    return ehNaoEncontrado(clube.error) ? (
      <Aviso
        icone={<SearchX className="size-5" />}
        titulo="Clube não encontrado"
        descricao="O endereço pode estar errado ou o clube não existe."
        acao={
          <Button asChild variant="outline">
            <Link to="/clubes">
              <ArrowLeft />
              Voltar para clubes
            </Link>
          </Button>
        }
      />
    ) : (
      <Aviso
        icone={<CloudOff className="size-5" />}
        titulo="Não foi possível carregar o clube"
        descricao={extrairMensagemErro(clube.error)}
        acao={
          <Button type="button" variant="outline" onClick={() => void clube.refetch()}>
            <RotateCw />
            Tentar de novo
          </Button>
        }
      />
    );
  }

  if (clube.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-label="Carregando clube">
        <Skeleton className="h-11 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["caixa", "elenco", "patrimonio", "jogadores"].map((cartao) => (
            <Skeleton key={cartao} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const { name, acronym, players } = clube.data;

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
            {acronym}
          </span>
          <div>
            <h1 className="text-2xl font-semibold">{name}</h1>
            <div className="mt-1 flex gap-2">
              <Badge variant="outline">Sigla {acronym}</Badge>
              <Badge variant="outline">
                {players.length} de {limiteDoElenco} jogadores
              </Badge>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link to="/jogadores" search={{ situacao: "livres" }}>
            <ShoppingCart />
            Comprar jogadores
          </Link>
        </Button>
      </div>

      <CartoesDoClube clube={clube.data} />
      {jogadorParaVender && (
        <ModalVenderJogador
          key={jogadorParaVender.id}
          jogador={jogadorParaVender}
          clube={clube.data}
          aoFechar={() => setJogadorParaVender(undefined)}
          aoVerHistorico={() => {
            setJogadorParaVender(undefined);
            void navegar({ search: { aba: "historico" } });
          }}
        />
      )}

      <Tabs
        className="mt-6"
        value={aba}
        onValueChange={(valor) =>
          void navegar({ search: { aba: valor === "elenco" ? undefined : (valor as Aba) } })
        }
      >
        <TabsList>
          <TabsTrigger value="elenco">
            Elenco <Badge variant="secondary">{players.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="escalacao">Escalação</TabsTrigger>
          <TabsTrigger value="historico">
            Histórico
            {historico.data && <Badge variant="secondary">{historico.data.data.length}</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="elenco" className="mt-4">
          <TabelaDoElenco jogadores={players} consulta={clube} aoVender={setJogadorParaVender} />
          <p className="mt-3 text-xs text-muted-foreground">
            Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Valor de mercado, dias
            restantes e % de multa calculados pela API para uma venda agora; a multa tem teto de
            10,00.
          </p>
        </TabsContent>
        <TabsContent value="escalacao" className="mt-4">
          <EscalacaoDoClube clube={clube.data} />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <HistoricoDoClube clubeId={clube.data.id} />
        </TabsContent>
      </Tabs>
    </>
  );
}
