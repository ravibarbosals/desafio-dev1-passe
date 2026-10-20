import { esquemaDaPartida, montarPartida, partidaVazia } from "../esquema-da-partida";

function mensagens(dados: unknown): Record<string, string | undefined> {
  const resultado = esquemaDaPartida.safeParse(dados);
  if (resultado.success) {
    return {};
  }
  return Object.fromEntries(
    resultado.error.issues.map((falha) => [String(falha.path[0]), falha.message]),
  );
}

describe("esquemaDaPartida", () => {
  it("pede o mandante e o visitante (L02)", () => {
    expect(mensagens(partidaVazia)).toEqual({
      mandante: "Escolha o mandante.",
      visitante: "Escolha o visitante.",
    });
  });

  it("recusa o mesmo clube dos dois lados", () => {
    expect(mensagens({ mandante: "1", visitante: "1" })).toEqual({
      visitante: "Escolha um clube diferente do mandante.",
    });
  });

  it("aceita dois clubes diferentes", () => {
    expect(mensagens({ mandante: "2", visitante: "1" })).toEqual({});
  });
});

describe("montarPartida", () => {
  it("monta o corpo do POST /matches", () => {
    expect(montarPartida({ mandante: "2", visitante: "1" })).toEqual({
      home_club_id: 2,
      away_club_id: 1,
    });
  });
});
