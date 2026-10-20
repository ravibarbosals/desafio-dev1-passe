import { podeMudarDeCondicao, saiDaEscalacao } from "../condicao";

describe("podeMudarDeCondicao", () => {
  it("de DOENTE não vai direto para APTO (J10)", () => {
    expect(podeMudarDeCondicao("DOENTE", "APTO")).toBe(false);
    expect(podeMudarDeCondicao("DOENTE", "MAL_CONDICIONADO")).toBe(true);
    expect(podeMudarDeCondicao("DOENTE", "DOENTE")).toBe(true);
  });

  it("de APTO e de MAL_CONDICIONADO vai para qualquer uma", () => {
    expect(podeMudarDeCondicao("APTO", "DOENTE")).toBe(true);
    expect(podeMudarDeCondicao("MAL_CONDICIONADO", "APTO")).toBe(true);
  });
});

describe("saiDaEscalacao", () => {
  const titulares = [{ id: 30 }, { id: 31 }];

  it("avisa quando um titular passa a DOENTE (J16)", () => {
    expect(saiDaEscalacao({ id: 31, condition: "APTO" }, "DOENTE", titulares)).toBe(true);
    expect(saiDaEscalacao({ id: 31, condition: "MAL_CONDICIONADO" }, "DOENTE", titulares)).toBe(
      true,
    );
  });

  it("não avisa para reserva, outra condição ou quem já está DOENTE", () => {
    expect(saiDaEscalacao({ id: 99, condition: "APTO" }, "DOENTE", titulares)).toBe(false);
    expect(saiDaEscalacao({ id: 31, condition: "APTO" }, "MAL_CONDICIONADO", titulares)).toBe(
      false,
    );
    expect(saiDaEscalacao({ id: 31, condition: "DOENTE" }, "DOENTE", titulares)).toBe(false);
  });

  it("sem os titulares carregados (livre, carregando ou erro), não avisa", () => {
    expect(saiDaEscalacao({ id: 31, condition: "APTO" }, "DOENTE", undefined)).toBe(false);
  });
});
