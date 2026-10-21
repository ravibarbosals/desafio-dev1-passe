import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { Toaster } from "@/componentes/ui/sonner";
import { criarClienteQuery } from "@/lib/cliente-query";
import { servidor } from "@/testes/servidor";

import { ModalNovoJogador } from "../ModalNovoJogador";

const jogadores = "http://localhost:3000/api/v1/players";

const valores: [string, string][] = [
  ["Idade", "24"],
  ["Agilidade", "80"],
  ["Velocidade", "70"],
  ["Finalização", "75"],
  ["Passe", "60"],
  ["Drible", "65"],
  ["Defesa", "40"],
  ["Físico", "55"],
  ["Potencial", "85"],
];

function abrir() {
  const aoMudarAberto = vi.fn();
  render(
    <QueryClientProvider client={criarClienteQuery()}>
      <ModalNovoJogador aberto aoMudarAberto={aoMudarAberto} />
      <Toaster />
    </QueryClientProvider>,
  );
  return { modal: screen.getByRole("dialog", { name: "Novo jogador" }), aoMudarAberto };
}

async function preencher(modal: HTMLElement) {
  await userEvent.type(within(modal).getByLabelText("Nome"), "Carlos Henrique");
  await userEvent.click(within(modal).getByRole("button", { name: /^ATA/ }));
  for (const [rotulo, valor] of valores) {
    await userEvent.type(within(modal).getByLabelText(rotulo), valor);
  }
}

// FLX-001 (J05 a J07): validação junto ao campo, envio e resultado calculado pela API
describe("ModalNovoJogador", () => {
  it("mostra o erro junto a cada campo e não envia o formulário vazio", async () => {
    let enviou = false;
    servidor.use(
      http.post(jogadores, () => {
        enviou = true;
        return HttpResponse.json({});
      }),
    );
    const { modal } = abrir();

    await userEvent.click(within(modal).getByRole("button", { name: "Salvar jogador" }));

    expect(await within(modal).findByText("Escolha a posição.")).toBeInTheDocument();
    expect(within(modal).getByText("Informe a idade.")).toBeInTheDocument();
    expect(within(modal).getByText("Informe a agilidade.")).toBeInTheDocument();
    expect(within(modal).getByLabelText("Nome")).toHaveAttribute("aria-invalid", "true");
    expect(enviou).toBe(false);
  });

  it("envia os números e mostra o resultado calculado pela API", async () => {
    let corpo: unknown;
    servidor.use(
      http.post(jogadores, async ({ request }) => {
        corpo = await request.json();
        return HttpResponse.json(
          {
            id: 9,
            name: "Carlos Henrique",
            position: "ATA",
            agility: 80,
            age: 24,
            condition: "APTO",
            base_value: 12.5,
            market_value: 13.75,
            pace: 70,
            shooting: 75,
            passing: 60,
            dribbling: 65,
            defending: 40,
            physical: 55,
            potential: 85,
            overall: 71,
            club_id: null,
          },
          { status: 201 },
        );
      }),
    );
    const { modal } = abrir();

    await preencher(modal);
    await userEvent.click(within(modal).getByRole("button", { name: "Salvar jogador" }));

    const resultado = await screen.findByRole("dialog", { name: "Jogador cadastrado" });
    expect(corpo).toEqual({
      name: "Carlos Henrique",
      position: "ATA",
      age: 24,
      agility: 80,
      pace: 70,
      shooting: 75,
      passing: 60,
      dribbling: 65,
      defending: 40,
      physical: 55,
      potential: 85,
    });
    expect(within(resultado).getByText(/12,50/)).toBeInTheDocument();
    expect(within(resultado).getByText(/13,75/)).toBeInTheDocument();
    expect(within(resultado).getByText("71")).toBeInTheDocument();
  });

  it("mostra o message da API quando ela recusa o cadastro", async () => {
    servidor.use(
      http.post(jogadores, () =>
        HttpResponse.json(
          { message: "A soma dos atributos não pode passar de 480." },
          { status: 400 },
        ),
      ),
    );
    const { modal } = abrir();

    await preencher(modal);
    await userEvent.click(within(modal).getByRole("button", { name: "Salvar jogador" }));

    expect(
      await screen.findByText("A soma dos atributos não pode passar de 480."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Novo jogador" })).toBeInTheDocument();
  });
});
