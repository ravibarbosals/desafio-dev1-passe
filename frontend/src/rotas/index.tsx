import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: PaginaInicial,
});

function PaginaInicial() {
  return <h1>Gestão da liga, do mercado à classificação</h1>;
}
