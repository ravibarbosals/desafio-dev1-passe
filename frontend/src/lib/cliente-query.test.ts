import { criarClienteQuery } from "./cliente-query";

describe("criarClienteQuery", () => {
  it("não repete mutation que falhou (DEC-007)", () => {
    expect(criarClienteQuery().getDefaultOptions().mutations?.retry).toBe(0);
  });
});
