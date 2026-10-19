import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { TituloPagina } from "@/componentes/layout/TituloPagina";

export const Route = createFileRoute("/jogadores/")({
  component: PaginaJogadores,
});

// A tabela entra na TASK-046
function PaginaJogadores() {
  return (
    <TituloPagina
      icone={Users}
      titulo="Jogadores"
      descricao="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
    />
  );
}
