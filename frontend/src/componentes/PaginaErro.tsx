import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";

// Erro inesperado de renderização; o erro da API é tratado em cada tela com o message (TASK-018)
export function PaginaErro({ reset }: ErrorComponentProps) {
  const roteador = useRouter();

  function tentarNovamente() {
    reset();
    void roteador.invalidate();
  }

  return (
    <section>
      <h1>Algo deu errado</h1>
      <p>Não foi possível exibir esta página.</p>
      <button type="button" onClick={tentarNovamente}>
        Tentar novamente
      </button>
    </section>
  );
}
