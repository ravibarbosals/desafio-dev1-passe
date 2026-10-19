import { calcularIntervalo, listarPaginasVisiveis } from "../paginacao";

describe("calcularIntervalo", () => {
  it.each([
    [1, 23, { inicio: 1, fim: 10 }],
    [3, 23, { inicio: 21, fim: 23 }],
    [1, 10, { inicio: 1, fim: 10 }],
    [1, 0, { inicio: 0, fim: 0 }],
  ])("página %s de %s itens → %o", (pagina, totalItens, esperado) => {
    expect(calcularIntervalo(pagina, 10, totalItens)).toEqual(esperado);
  });

  it("página depois da última (a API devolve data vazia) não passa do total", () => {
    expect(calcularIntervalo(4, 10, 23)).toEqual({ inicio: 23, fim: 23 });
  });
});

describe("listarPaginasVisiveis", () => {
  it.each([
    [1, 0, []],
    [1, 1, [1]],
    [2, 3, [1, 2, 3]],
    [4, 7, [1, 2, 3, 4, 5, 6, 7]],
    [1, 10, [1, 2, "reticencias", 10]],
    [3, 10, [1, 2, 3, 4, "reticencias", 10]],
    [5, 10, [1, "reticencias", 4, 5, 6, "reticencias", 10]],
    [10, 10, [1, "reticencias", 9, 10]],
  ])("página %s de %s → %o", (pagina, totalPaginas, esperado) => {
    expect(listarPaginasVisiveis(pagina, totalPaginas)).toEqual(esperado);
  });
});
