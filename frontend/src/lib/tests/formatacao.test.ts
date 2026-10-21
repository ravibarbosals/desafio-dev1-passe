import {
  formatarDataHora,
  formatarInteiroComSinal,
  formatarMoeda,
  formatarMoedaComSinal,
  montarDataHoraBrasilia,
} from "../formatacao";

describe("formatarMoedaComSinal", () => {
  it.each([
    [7.8, "+7,80"],
    [46.02, "+46,02"],
    [0, "0,00"],
    [-4.8, "-4,80"],
    [-0.39, "-0,39"],
  ])("%s → %s", (valor, esperado) => {
    expect(formatarMoedaComSinal(valor)).toBe(esperado);
  });
});

describe("formatarMoeda", () => {
  it.each([
    [26, "26,00"],
    [40.43, "40,43"],
    [1234.5, "1.234,50"],
    [0, "0,00"],
    [-38.85, "-38,85"],
    [-0.39, "-0,39"],
  ])("%s → %s", (valor, esperado) => {
    expect(formatarMoeda(valor)).toBe(esperado);
  });
});

describe("formatarDataHora", () => {
  it("mostra a data e a hora de Brasília que a API devolveu", () => {
    expect(formatarDataHora("2026-11-12T15:00:00-03:00")).toBe("12/11/2026 15:00");
  });

  it("converte para Brasília um instante vindo em outro fuso", () => {
    expect(formatarDataHora("2026-11-12T02:30:00Z")).toBe("11/11/2026 23:30");
  });
});

describe("montarDataHoraBrasilia", () => {
  it("junta data e hora com o fuso de Brasília", () => {
    expect(montarDataHoraBrasilia("2027-12-31", "18:30")).toBe("2027-12-31T18:30-03:00");
  });
});

describe("formatarInteiroComSinal", () => {
  it.each([
    [2, "+2"],
    [0, "0"],
    [-2, "-2"],
  ])("%s → %s", (valor, esperado) => {
    expect(formatarInteiroComSinal(valor)).toBe(esperado);
  });
});
