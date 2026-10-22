import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const base = "http://localhost:3000/api/v1";
const clubes = `${base}/clubs`;

describe("criarRoteador", () => {
  beforeEach(() => {
    servidor.use(
      http.get(clubes, () =>
        HttpResponse.json([
          { id: 1, name: "Águias FC", acronym: "AGU", cash: 300, squad_value: 0, net_worth: 300 },
        ]),
      ),
      http.get(`${base}/players`, ({ request }) => {
        const livres = new URL(request.url).searchParams.get("free") === "true";
        return HttpResponse.json({
          data: [],
          meta: { page: 1, limit: 10, total_items: livres ? 7 : 23, total_pages: 3 },
        });
      }),
      http.get(`${base}/matches`, () => HttpResponse.json([])),
    );
  });

  it("abre em / sem o menu, com os números da API", async () => {
    abrir("/");

    expect(await screen.findByRole("heading", { name: /gestão da liga/i })).toBeInTheDocument();
    expect(await screen.findByText("23")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/nenhuma partida ainda/)).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Menu principal" })).not.toBeInTheDocument();
  });

  it("vai para os jogadores pelo Enter", async () => {
    abrir("/");
    await screen.findByRole("heading", { name: /gestão da liga/i });

    await userEvent.keyboard("{Enter}");

    expect(await screen.findByRole("heading", { name: "Jogadores" })).toBeInTheDocument();
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

  it("mostra o clube não encontrado com o caminho de volta (E04)", async () => {
    servidor.use(
      http.get(`${clubes}/99`, () =>
        HttpResponse.json({ message: "Clube não encontrado." }, { status: 404 }),
      ),
    );
    abrir("/clubes/99");

    expect(await screen.findByText("Clube não encontrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para clubes" })).toHaveAttribute(
      "href",
      "/clubes",
    );
    const trilha = screen.getByRole("navigation", { name: "Trilha" });
    expect(within(trilha).getByText("Clube 99")).toBeInTheDocument();
    expect(within(trilha).getByRole("link", { name: "Clubes" })).toHaveAttribute("href", "/clubes");
  });
});
