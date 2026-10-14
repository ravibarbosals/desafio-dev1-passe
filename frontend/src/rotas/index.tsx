import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: PaginaInicial,
});

function PaginaInicial() {
  return <h1 className="text-2xl font-semibold">Gestão da liga, do mercado à classificação</h1>;
}
