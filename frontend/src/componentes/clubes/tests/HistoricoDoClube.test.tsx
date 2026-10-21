import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import type { Transacao } from "@/api/mercado";
import { Toaster } from "@/componentes/ui/sonner";
import { baixarArquivo } from "@/lib/arquivo";
import { criarClienteQuery } from "@/lib/cliente-query";
import { servidor } from "@/testes/servidor";

import { HistoricoDoClube } from "../HistoricoDoClube";

// O download de verdade não existe no happy-dom; o teste confere o que seria baixado
vi.mock("@/lib/arquivo", () => ({ baixarArquivo: vi.fn() }));

const base = "http://localhost:3000/api/v1/clubs/1/transactions";

const compra: Transacao = {
  id: 1,
  club_id: 1,
  player_id: 7,
  player_name: "Ana Souza",
  type: "COMPRA",
  value: 20,
  fee: 0,
  penalty: 0,
  profit: null,
  cash_change: -20,
  created_at: "2026-11-10T10:00:00-03:00",
};
const venda: Transacao = {
  ...compra,
  id: 2,
  type: "VENDA",
  value: 28,
  fee: 0.8,
  profit: 8,
  cash_change: 27.2,
  created_at: "2026-11-12T10:00:00-03:00",
};
const resumo = {
  total_spent: 20,
  total_received: 28,
  total_fees: 0.8,
  total_penalties: 0,
  total_profit: 8,
};

// Espera a lista chegar: antes dela, a tabela mostra as linhas de espera
async function abrir() {
  render(
    <QueryClientProvider client={criarClienteQuery()}>
      <HistoricoDoClube clubeId={1} />
      <Toaster />
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(3));
}

// FLX-007 (H01 a H05): filtros que vão para a API, totais do summary e Exportar CSV
describe("HistoricoDoClube", () => {
  it("mostra as transações e os totais da API e filtra pelo tipo (AM-007)", async () => {
    const tiposPedidos: (string | null)[] = [];
    servidor.use(
      http.get(base, ({ request }) => {
        const tipo = new URL(request.url).searchParams.get("type");
        tiposPedidos.push(tipo);
        return HttpResponse.json(
          tipo === "VENDA"
            ? { data: [venda], summary: { ...resumo, total_spent: 0 } }
            : { data: [venda, compra], summary: resumo },
        );
      }),
    );
    await abrir();

    expect(screen.getByText("Total pago em compras").parentElement).toHaveTextContent("20,00");

    await userEvent.click(screen.getByRole("checkbox", { name: "Compra" }));

    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(2));
    expect(tiposPedidos).toContain("VENDA");
    expect(screen.getByRole("checkbox", { name: "Venda" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Limpar filtros/ })).toBeInTheDocument();
  });

  it("baixa o CSV com o nome do Content-Disposition e os mesmos filtros", async () => {
    let tipoExportado: string | null = "";
    servidor.use(
      http.get(base, () => HttpResponse.json({ data: [venda, compra], summary: resumo })),
      http.get(`${base}/export`, ({ request }) => {
        tipoExportado = new URL(request.url).searchParams.get("type");
        return new HttpResponse("data;tipo\n", {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="historico-aguias.csv"',
          },
        });
      }),
    );
    await abrir();

    await userEvent.click(screen.getByRole("checkbox", { name: "Venda" }));
    await userEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

    await waitFor(() =>
      expect(baixarArquivo).toHaveBeenCalledWith("historico-aguias.csv", "data;tipo\n", "text/csv"),
    );
    expect(tipoExportado).toBe("COMPRA");
    expect(await screen.findByText("CSV baixado: historico-aguias.csv")).toBeInTheDocument();
  });

  it("mostra o message quando a API recusa o filtro (H05)", async () => {
    servidor.use(
      http.get(base, ({ request }) =>
        new URL(request.url).searchParams.get("type") === "VENDA"
          ? HttpResponse.json({ message: "Filtro inválido." }, { status: 400 })
          : HttpResponse.json({ data: [venda, compra], summary: resumo }),
      ),
    );
    await abrir();

    await userEvent.click(screen.getByRole("checkbox", { name: "Compra" }));

    expect(await screen.findByText("Filtro inválido.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
