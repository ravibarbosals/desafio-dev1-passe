import { iniciaisDoNome } from "../AvatarDoJogador";

describe("iniciaisDoNome", () => {
  it("usa a primeira letra do primeiro e do último nome", () => {
    expect(iniciaisDoNome("Gabriel Antunes")).toBe("GA");
    expect(iniciaisDoNome("João da Silva")).toBe("JS");
  });

  it("mantém o acento e aceita um nome só", () => {
    expect(iniciaisDoNome("Énio Carvalho")).toBe("ÉC");
    expect(iniciaisDoNome("ícaro")).toBe("Í");
  });
});
