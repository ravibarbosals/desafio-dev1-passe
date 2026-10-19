import { createFileRoute } from "@tanstack/react-router";
import { Swords } from "lucide-react";

import { TituloPagina } from "@/componentes/layout/TituloPagina";

export const Route = createFileRoute("/partidas/")({
  component: PaginaPartidas,
});

// O histórico e a nova partida entram na TASK-053
function PaginaPartidas() {
  return (
    <TituloPagina
      icone={Swords}
      titulo="Partidas"
      descricao="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
    />
  );
}
