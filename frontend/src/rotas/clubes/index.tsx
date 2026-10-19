import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";

import { TituloPagina } from "@/componentes/layout/TituloPagina";

export const Route = createFileRoute("/clubes/")({
  component: PaginaClubes,
});

// A lista entra na TASK-048
function PaginaClubes() {
  return (
    <TituloPagina
      icone={Shield}
      titulo="Clubes"
      descricao="Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes."
    />
  );
}
