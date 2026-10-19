import { createFileRoute } from "@tanstack/react-router";
import { ListOrdered } from "lucide-react";

import { TituloPagina } from "@/componentes/layout/TituloPagina";

export const Route = createFileRoute("/classificacao")({
  component: PaginaClassificacao,
});

// A tabela entra na TASK-054
function PaginaClassificacao() {
  return (
    <TituloPagina
      icone={ListOrdered}
      titulo="Classificação"
      descricao="Todos os clubes, com 3 pontos por vitória e 1 por empate."
    />
  );
}
