import type { ResultadoDaVenda } from "@/api/mercado";

import { descreverVenda, explicarComissao, explicarMulta } from "../venda";

// Exemplo do E 2.3.2 (API.md, Mercado 5.2)
const venda: ResultadoDaVenda = {
  id: 11,
  club_id: 1,
  player_id: 2,
  player_name: "Meia Lua",
  type: "VENDA",
  value: 40,
  fee: 0.3,
  penalty: 4,
  profit: 3,
  cash_change: 35.7,
  created_at: "2026-11-05T16:40:00-03:00",
  purchase_value: 37,
  remaining_days: 117,
  penalty_rate: 10,
  contract_status: "RESCINDIDO",
  club_cash: 296.85,
};

const fidelidadeCumprida: ResultadoDaVenda = {
  ...venda,
  penalty: 0,
  penalty_rate: 0,
  remaining_days: 0,
  profit: -4.8,
  fee: 0,
  contract_status: "ENCERRADO",
};

describe("descreverVenda", () => {
  it("contrato rescindido, com e sem saída da escalação (V02)", () => {
    expect(descreverVenda(venda, true)).toBe("Meia Lua voltou a ficar livre e saiu da escalação.");
    expect(descreverVenda(venda, false)).toBe("Meia Lua voltou a ficar livre.");
  });

  it("fidelidade cumprida avisa que não houve multa (V03)", () => {
    expect(descreverVenda(fidelidadeCumprida, false)).toBe(
      "Meia Lua voltou a ficar livre. A fidelidade já tinha terminado, então não houve multa.",
    );
  });
});

describe("explicarMulta e explicarComissao", () => {
  it("com multa e lucro", () => {
    expect(explicarMulta(venda)).toBe("10% do valor de venda, com teto de 10,00");
    expect(explicarComissao(venda)).toBe("10% do lucro até 10,00 + 20% do que passar");
  });

  it("sem multa e sem lucro", () => {
    expect(explicarMulta(fidelidadeCumprida)).toBe("Fidelidade cumprida: sem multa");
    expect(explicarComissao(fidelidadeCumprida)).toBe("Sem lucro: sem comissão");
  });
});
