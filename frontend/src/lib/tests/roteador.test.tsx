import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { servidor } from "../../testes/servidor";
import { criarClienteQuery } from "../cliente-query";
import { criarRoteador } from "../roteador";

// Como no main.tsx: as páginas buscam dados com o React Query
function abrir(caminho: string) {
  const roteador = criarRoteador(createMemoryHistory({ initialEntries: [caminho] }));
  render(
    <QueryClientProvider client={criarClienteQuery()}>
      <RouterProvider router={roteador} />
    </QueryClientProvider>,
  );
}

describe("criarRoteador", () => {
  it("abre a página inicial em /", async () => {
    abrir("/");

    expect(await screen.findByRole("heading", { name: /gestão da liga/i })).toBeInTheDocument();
  });

  it("mostra a página de não encontrado num caminho inexistente", async () => {
    abrir("/caminho-que-nao-existe");

    expect(
      await screen.findByRole("heading", { name: "Página não encontrada" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute("href", "/");
  });

  it("abre a página escolhida no menu e marca o item como atual", async () => {
    servidor.use(http.get("http://localhost:3000/api/v1/clubs", () => HttpResponse.json([])));
    abrir("/clubes");
    expect(await screen.findByRole("heading", { name: "Clubes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clubes" })).toHaveAttribute("aria-current", "page");
  });
});
