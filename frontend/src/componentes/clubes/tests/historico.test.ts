import type { Transacao } from "@/api/mercado";

import {
  alternarTipo,
  listarJogadoresDoHistorico,
  montarFiltroDoHistorico,
  todosOsJogadores,
} from "../historico";

function transacao(player_id: number, player_name: string): Transacao {
  return {
    id: player_id,
    club_id: 1,
    player_id,
    player_name,
    type: "COMPRA",
    value: 37,
    fee: 1.85,
    penalty: 0,
    profit: null,
    cash_change: -38.85,
    created_at: "2026-11-02T10:15:00-03:00",
  };
}

describe("alternarTipo", () => {
  it("desmarca um tipo quando o outro continua marcado", () => {
    expect(alternarTipo(["COMPRA", "VENDA"], "COMPRA")).toEqual(["VENDA"]);
  });

  it("não desmarca o último tipo (AM-007)", () => {
    expect(alternarTipo(["VENDA"], "VENDA")).toEqual(["VENDA"]);
  });

  it("marca de novo na ordem Compra, Venda", () => {
    expect(alternarTipo(["VENDA"], "COMPRA")).toEqual(["COMPRA", "VENDA"]);
  });
});

describe("montarFiltroDoHistorico", () => {
  it("sem filtros quando os dois tipos estão marcados e o jogador é todos", () => {
    expect(montarFiltroDoHistorico(["COMPRA", "VENDA"], todosOsJogadores)).toEqual({});
  });

  it("um tipo e um jogador", () => {
    expect(montarFiltroDoHistorico(["VENDA"], "2")).toEqual({ type: "VENDA", player_id: 2 });
  });
});

describe("listarJogadoresDoHistorico", () => {
  it("um item por jogador, com o nome mais recente, em ordem alfabética", () => {
    const transacoes = [
      transacao(2, "Meia Lua Jr."),
      transacao(5, "Ana Costa"),
      transacao(2, "Meia Lua"),
    ];

    expect(listarJogadoresDoHistorico(transacoes)).toEqual([
      { id: 5, nome: "Ana Costa" },
      { id: 2, nome: "Meia Lua Jr." },
    ]);
  });
});
