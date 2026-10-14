import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";

import { Button } from "@/componentes/ui/button";

// Erro inesperado de renderização; o erro da API é tratado em cada tela com o message (TASK-018)
export function PaginaErro({ reset }: ErrorComponentProps) {
  const roteador = useRouter();

  function tentarNovamente() {
    reset();
    void roteador.invalidate();
  }

  return (
    <section className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="text-muted-foreground">Não foi possível exibir esta página.</p>
      <Button type="button" onClick={tentarNovamente}>
        Tentar novamente
      </Button>
    </section>
  );
}
