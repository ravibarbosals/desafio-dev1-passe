import { lerFaixa, type RegrasDaFaixa } from "../faixa";

const idade: RegrasDaFaixa = {
  rotulos: { minimo: "Idade mínima", maximo: "Idade máxima" },
  piso: 16,
  teto: 45,
  casas: 0,
};

const valor: RegrasDaFaixa = {
  rotulos: { minimo: "Valor mínimo", maximo: "Valor máximo" },
  piso: 0,
  teto: 550,
  casas: 2,
};

describe("lerFaixa", () => {
  it("os dois lados vazios: faixa válida, sem filtro", () => {
    expect(lerFaixa(" ", "", idade)).toEqual({
      valida: true,
      minimo: undefined,
      maximo: undefined,
    });
  });

  it.each([
    ["18", "30", 18, 30],
    ["16", "45", 16, 45],
    ["20", "", 20, undefined],
    ["", "20", undefined, 20],
    ["30", "30", 30, 30],
  ])("idade %o a %o", (minimo, maximo, esperadoMinimo, esperadoMaximo) => {
    expect(lerFaixa(minimo, maximo, idade)).toEqual({
      valida: true,
      minimo: esperadoMinimo,
      maximo: esperadoMaximo,
    });
  });

  it.each(["15", "46", "18.5", "-18", "dez"])("idade %o fora da regra", (minimo) => {
    expect(lerFaixa(minimo, "", idade)).toEqual({
      valida: false,
      erro: "Idade mínima deve ser um número inteiro de 16 a 45.",
    });
  });

  it("valor aceita vírgula ou ponto e até 2 casas", () => {
    expect(lerFaixa("10,5", "60.25", valor)).toEqual({ valida: true, minimo: 10.5, maximo: 60.25 });
    expect(lerFaixa("0", "550", valor)).toEqual({ valida: true, minimo: 0, maximo: 550 });
  });

  it.each(["10,555", "550,01", "-1", "1e2"])("valor %o fora da regra", (maximo) => {
    expect(lerFaixa("", maximo, valor)).toEqual({
      valida: false,
      erro: "Valor máximo deve ser um valor de 0 a 550, com até 2 casas decimais.",
    });
  });

  it("mínimo maior que o máximo", () => {
    expect(lerFaixa("31", "30", idade)).toEqual({
      valida: false,
      erro: "Idade mínima não pode ser maior que idade máxima.",
    });
  });
});
