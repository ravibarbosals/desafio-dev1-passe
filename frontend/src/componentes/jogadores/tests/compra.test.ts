import type { ResultadoDaCompra } from "@/api/mercado";

import { calcularCustoTotal, explicarTaxa } from "../compra";

// Exemplo do E 2.3.1 (API.md, Mercado 5.1)
const compra: ResultadoDaCompra = {
  id: 10,
  club_id: 1,
  player_id: 2,
  player_name: "Meia Lua",
  type: "COMPRA",
  value: 37,
  fee: 1.85,
  penalty: 0,
  profit: null,
  cash_change: -38.85,
  created_at: "2026-11-02T10:15:00-03:00",
  contract: { purchase_value: 37, loyalty_until: "2027-03-02T10:15:00-03:00", status: "ATIVO" },
  club_cash: 261.15,
};

describe("calcularCustoTotal", () => {
  it("soma valor e taxa (E 2.3.1)", () => {
    expect(calcularCustoTotal(compra)).toBe(38.85);
  });

  it("não erra no ponto flutuante", () => {
    expect(calcularCustoTotal({ ...compra, value: 0.1, fee: 0.2 })).toBe(0.3);
  });
});

describe("explicarTaxa", () => {
  it("com e sem taxa (RN13)", () => {
    expect(explicarTaxa(compra)).toBe("5% do valor, porque passa de 30,00");
    expect(explicarTaxa({ ...compra, value: 24, fee: 0 })).toBe("Sem taxa: valor até 30,00");
  });
});
