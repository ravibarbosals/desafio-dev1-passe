import { esquemaDoNovoClube } from "../esquema-do-clube";

// Primeira mensagem de cada campo, como o zodResolver mostra
function mensagens(dados: unknown) {
  const resultado = esquemaDoNovoClube.safeParse(dados);
  const porCampo: Record<string, string> = {};
  for (const falha of resultado.error?.issues ?? []) {
    porCampo[String(falha.path[0])] ??= falha.message;
  }
  return porCampo;
}

describe("esquemaDoNovoClube", () => {
  it("aceita nome e sigla válidos e tira os espaços das pontas", () => {
    expect(esquemaDoNovoClube.parse({ name: "  Águias FC ", acronym: "AGU" })).toEqual({
      name: "Águias FC",
      acronym: "AGU",
    });
  });

  it("obrigatórios", () => {
    expect(mensagens({ name: "  ", acronym: "" })).toEqual({
      name: "Informe o nome.",
      acronym: "Informe a sigla.",
    });
  });

  it("nome de 3 a 60 caracteres", () => {
    expect(mensagens({ name: "AB", acronym: "ABC" })).toEqual({
      name: "Use de 3 a 60 caracteres.",
    });
    expect(mensagens({ name: "A".repeat(61), acronym: "ABC" })).toEqual({
      name: "Use de 3 a 60 caracteres.",
    });
    expect(mensagens({ name: "A".repeat(60), acronym: "ABC" })).toEqual({});
  });

  it("sigla com 3 letras maiúsculas de A a Z", () => {
    for (const sigla of ["AG", "AGUA", "agu", "AG1", "ÁGU"]) {
      expect(mensagens({ name: "Águias FC", acronym: sigla })).toEqual({
        acronym: "Use 3 letras maiúsculas, de A a Z.",
      });
    }
  });
});
