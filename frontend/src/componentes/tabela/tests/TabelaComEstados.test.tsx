import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mensagemErroPadrao } from "@/lib/erro-api";

import { TabelaComEstados, type ColunaDaTabela } from "../TabelaComEstados";

interface Linha {
  id: number;
  nome: string;
  valor: string;
}

const colunas: ColunaDaTabela<Linha>[] = [
  { titulo: "Nome", celula: (linha) => linha.nome },
  { titulo: "Valor", celula: (linha) => linha.valor, alinharADireita: true },
];

const textos = {
  carregando: "Carregando itens…",
  erro: "Não foi possível carregar os itens",
  vazio: "Nenhum item",
};

function consulta(estado: { isPending?: boolean; isError?: boolean; error?: Error } = {}) {
  return { isPending: false, isError: false, error: null, refetch: vi.fn(), ...estado };
}

// REQ-045: os três estados de toda lista (E01 a E03) e as linhas
describe("TabelaComEstados", () => {
  it("mostra o carregando com as linhas de espera, sem dados", () => {
    render(
      <TabelaComEstados
        colunas={colunas}
        linhas={undefined}
        chave={(linha) => linha.id}
        consulta={consulta({ isPending: true })}
        textos={textos}
      />,
    );

    expect(screen.getByText("Carregando itens…")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("mostra o erro com a mensagem e busca de novo pelo botão", async () => {
    const comErro = consulta({ isError: true, error: new Error("falhou") });
    render(
      <TabelaComEstados
        colunas={colunas}
        linhas={undefined}
        chave={(linha) => linha.id}
        consulta={comErro}
        textos={textos}
      />,
    );

    expect(screen.getByText("Não foi possível carregar os itens")).toBeInTheDocument();
    expect(screen.getByText(mensagemErroPadrao)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(comErro.refetch).toHaveBeenCalledOnce();
  });

  it("mostra o vazio com a ação recebida", () => {
    render(
      <TabelaComEstados
        colunas={colunas}
        linhas={[]}
        chave={(linha) => linha.id}
        consulta={consulta()}
        textos={textos}
        acaoVazio={<button type="button">Limpar filtros</button>}
      />,
    );

    expect(screen.getByText("Nenhum item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar filtros" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("mostra uma linha por item, com os valores à direita, e o rodapé", () => {
    render(
      <TabelaComEstados
        colunas={colunas}
        linhas={[
          { id: 1, nome: "Ana Souza", valor: "10,00" },
          { id: 2, nome: "Bruno Lima", valor: "7,50" },
        ]}
        chave={(linha) => linha.id}
        consulta={consulta()}
        textos={textos}
        rodape={<p>Página 1 de 1</p>}
      />,
    );

    const linhas = screen.getAllByRole("row");
    expect(linhas).toHaveLength(3);
    expect(linhas[1]).toHaveTextContent("Ana Souza10,00");
    expect(screen.getByRole("cell", { name: "7,50" })).toHaveClass("text-right");
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
    expect(screen.queryByText("Carregando itens…")).not.toBeInTheDocument();
  });
});
