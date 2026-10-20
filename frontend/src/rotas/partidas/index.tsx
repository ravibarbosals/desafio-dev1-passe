import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Shield, Swords } from "lucide-react";
import { useState } from "react";

import { consultaDosClubes } from "@/api/clube";
import { consultaDasPartidas } from "@/api/partidas";
import { TituloPagina } from "@/componentes/layout/TituloPagina";
import { ModalNovaPartida } from "@/componentes/partidas/ModalNovaPartida";
import { Placar } from "@/componentes/partidas/Placar";
import { TabelaDePartidas } from "@/componentes/partidas/TabelaDePartidas";
import { Button } from "@/componentes/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";

// Valor do Select de clube sem filtro
const todosOsClubes = "todos";

export const Route = createFileRoute("/partidas/")({
  component: PaginaPartidas,
});

// L01, L02, E06: última partida, histórico com filtro por clube e Nova partida
function PaginaPartidas() {
  const [novaPartidaAberta, setNovaPartidaAberta] = useState(false);
  const [clube, setClube] = useState(todosOsClubes);
  const clubeId = clube === todosOsClubes ? undefined : Number(clube);
  const partidas = useQuery(consultaDasPartidas(clubeId));
  // A última partida é a primeira do histórico sem filtro (da mais recente para a mais antiga)
  const ultima = useQuery(consultaDasPartidas()).data?.[0];
  const clubes = useQuery(consultaDosClubes());

  const botaoNovaPartida = (
    <Button type="button" onClick={() => setNovaPartidaAberta(true)}>
      <Plus />
      Nova partida
    </Button>
  );

  return (
    <>
      <TituloPagina
        icone={Swords}
        titulo="Partidas"
        descricao="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        acao={botaoNovaPartida}
      />
      <ModalNovaPartida aberto={novaPartidaAberta} aoMudarAberto={setNovaPartidaAberta} />

      {ultima && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm text-muted-foreground">Última partida</h2>
          <Placar
            partida={ultima}
            acao={
              <Button asChild variant="outline">
                <Link to="/partidas/$id" params={{ id: String(ultima.id) }}>
                  Ver duelos
                  <ChevronRight />
                </Link>
              </Button>
            }
          />
        </section>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Histórico de partidas</h2>
          <p className="text-xs text-muted-foreground">Da mais recente para a mais antiga.</p>
        </div>
        <Select value={clube} onValueChange={setClube} disabled={!clubes.data}>
          <SelectTrigger aria-label="Clube">
            <Shield />
            <span className="text-muted-foreground">Clube:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={todosOsClubes}>todos</SelectItem>
            {clubes.data?.map(({ id, name }) => (
              <SelectItem key={id} value={String(id)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabelaDePartidas
        consulta={partidas}
        filtrado={clubeId !== undefined}
        acaoVazio={botaoNovaPartida}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Com filtro, entram as partidas em que o clube foi mandante ou visitante. "Ver duelos" abre a
        partida.
      </p>
    </>
  );
}
