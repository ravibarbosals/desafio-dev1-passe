import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CloudOff, RotateCw, SearchX } from "lucide-react";

import { consultaDaPartida } from "@/api/partidas";
import { Aviso } from "@/componentes/Aviso";
import { EmCampoDaPartida } from "@/componentes/partidas/EmCampoDaPartida";
import { Placar } from "@/componentes/partidas/Placar";
import { TabelaDosDuelos } from "@/componentes/partidas/TabelaDosDuelos";
import { Button } from "@/componentes/ui/button";
import { Skeleton } from "@/componentes/ui/skeleton";
import { ehNaoEncontrado, extrairMensagemErro } from "@/lib/erro-api";

export const Route = createFileRoute("/partidas/$id")({
  component: PaginaDaPartida,
});

// L03: a mesma página logo depois de jogar e ao abrir uma partida do histórico (F13)
function PaginaDaPartida() {
  const { id } = Route.useParams();
  // Id fora do formato também volta 404 da API (V8)
  const partida = useQuery(consultaDaPartida(Number(id)));

  if (partida.isError) {
    return ehNaoEncontrado(partida.error) ? (
      <Aviso
        icone={<SearchX className="size-5" />}
        titulo="Partida não encontrada"
        descricao="O endereço pode estar errado ou a partida não existe."
        acao={
          <Button asChild variant="outline">
            <Link to="/partidas">
              <ArrowLeft />
              Voltar para partidas
            </Link>
          </Button>
        }
      />
    ) : (
      <Aviso
        icone={<CloudOff className="size-5" />}
        titulo="Não foi possível carregar a partida"
        descricao={extrairMensagemErro(partida.error)}
        acao={
          <Button type="button" variant="outline" onClick={() => void partida.refetch()}>
            <RotateCw />
            Tentar de novo
          </Button>
        }
      />
    );
  }

  if (partida.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-label="Carregando partida">
        <Skeleton className="h-28" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/partidas">
          <ArrowLeft />
          Voltar para partidas
        </Link>
      </Button>
      <Placar partida={partida.data} />
      <div className="mt-6">
        <EmCampoDaPartida partida={partida.data} />
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Duelos</h2>
          <p className="text-xs text-muted-foreground">
            Os 3 ataques do mandante e depois os 3 do visitante. Os valores e a condição de cada
            titular são os gravados na partida: mal condicionado joga com 15% a menos (RN20).
          </p>
        </div>
        <TabelaDosDuelos partida={partida.data} />
      </section>
    </>
  );
}
