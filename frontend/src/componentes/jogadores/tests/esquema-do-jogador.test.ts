import { esquemaDoNovoJogador, formularioVazio } from "../esquema-do-jogador";

// Exemplo 2.1.3 do enunciado, como o formulário guarda (texto)
const davi = {
  name: "Davi Melo",
  position: "MEI" as const,
  age: "23",
  agility: "70",
  pace: "66",
  shooting: "62",
  passing: "74",
  dribbling: "70",
  defending: "48",
  physical: "58",
  potential: "82",
};

// Como o zodResolver mostra: a primeira mensagem de cada campo
function mensagens(dados: object): Record<string, string> {
  const resultado = esquemaDoNovoJogador.safeParse(dados);
  const primeiras: Record<string, string> = {};
  for (const problema of resultado.error?.issues ?? []) {
    primeiras[problema.path.join(".")] ??= problema.message;
  }
  return primeiras;
}

describe("esquemaDoNovoJogador", () => {
  it("converte o que foi digitado no corpo do POST /players", () => {
    expect(esquemaDoNovoJogador.parse({ ...davi, name: "  Davi Melo " })).toEqual({
      name: "Davi Melo",
      position: "MEI",
      age: 23,
      agility: 70,
      pace: 66,
      shooting: 62,
      passing: 74,
      dribbling: 70,
      defending: 48,
      physical: 58,
      potential: 82,
    });
  });

  it("formulário vazio: uma mensagem por campo", () => {
    expect(mensagens(formularioVazio)).toEqual({
      name: "Use de 3 a 100 caracteres.",
      position: "Escolha a posição.",
      age: "Informe a idade.",
      agility: "Informe a agilidade.",
      pace: "Informe a velocidade.",
      shooting: "Informe a finalização.",
      passing: "Informe o passe.",
      dribbling: "Informe o drible.",
      defending: "Informe a defesa.",
      physical: "Informe o físico.",
      potential: "Informe o potencial.",
    });
  });

  it.each([
    ["name", "Da", "Use de 3 a 100 caracteres."],
    ["name", "a".repeat(101), "Use de 3 a 100 caracteres."],
    ["age", "15", "Use uma idade de 16 a 45 anos."],
    ["age", "46", "Use uma idade de 16 a 45 anos."],
    ["age", "20.5", "Use uma idade de 16 a 45 anos."],
    ["agility", "0", "Use um valor de 1 a 100."],
    ["agility", "101", "Use um valor de 1 a 100."],
    ["passing", "120", "Use um valor de 1 a 99."],
    ["potential", "-1", "Use um valor de 1 a 99."],
  ])("%s = %o → %s", (campo, valor, mensagem) => {
    expect(mensagens({ ...davi, [campo]: valor })).toEqual({ [campo]: mensagem });
  });

  it.each([
    ["name", "Ana"],
    ["name", "a".repeat(100)],
    ["age", "16"],
    ["age", "45"],
    ["agility", "100"],
    ["pace", "1"],
    ["pace", "99"],
  ])("limite aceito: %s = %o", (campo, valor) => {
    expect(mensagens({ ...davi, [campo]: valor })).toEqual({});
  });

  it("regras que cruzam campos ficam com a API: soma acima de 480 passa na tela", () => {
    expect(
      mensagens({
        ...davi,
        pace: "99",
        shooting: "99",
        passing: "99",
        dribbling: "99",
        defending: "85",
      }),
    ).toEqual({});
  });
});
