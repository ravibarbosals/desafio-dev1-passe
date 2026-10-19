import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";

import { criarRoteador } from "../roteador";

function abrir(caminho: string) {
  const roteador = criarRoteador(createMemoryHistory({ initialEntries: [caminho] }));
  render(<RouterProvider router={roteador} />);
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
    abrir("/clubes");
    expect(await screen.findByRole("heading", { name: "Clubes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clubes" })).toHaveAttribute("aria-current", "page");
  });
});
