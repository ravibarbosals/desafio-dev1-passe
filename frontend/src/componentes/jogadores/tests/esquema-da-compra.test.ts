import { compraVazia, esquemaDaCompra, montarCompra } from "../esquema-da-compra";

function mensagens(dados: unknown): Record<string, string | undefined> {
  const resultado = esquemaDaCompra.safeParse(dados);
  if (resultado.success) {
    return {};
  }
  return Object.fromEntries(
    resultado.error.issues.map((falha) => [String(falha.path[0]), falha.message]),
  );
}

describe("esquemaDaCompra", () => {
  it("pede clube, data e hora (M01)", () => {
    expect(mensagens(compraVazia)).toEqual({
      clube: "Escolha o clube comprador.",
      data: "Informe a data.",
      hora: "Informe a hora.",
    });
  });

  it("aceita o que os campos de data e hora devolvem", () => {
    expect(mensagens({ clube: "6", data: "2027-11-12", hora: "15:00" })).toEqual({});
  });
});

describe("montarCompra", () => {
  it("envia o fim da fidelidade no horário de Brasília, com -03:00 (F06)", () => {
    expect(montarCompra({ clube: "6", data: "2027-11-12", hora: "15:00" })).toEqual({
      club_id: 6,
      loyalty_until: "2027-11-12T15:00-03:00",
    });
  });
});
