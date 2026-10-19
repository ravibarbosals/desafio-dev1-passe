import { montarParametrosDaListagem } from "../jogadores";

describe("montarParametrosDaListagem", () => {
  it("sem filtros não manda nada: a API usa nome, página 1 e 10 por página", () => {
    expect(montarParametrosDaListagem({ situacao: "todos", ordem: "name", pagina: 1 })).toEqual({});
  });

  it("converte cada filtro no query param do enunciado", () => {
    expect(
      montarParametrosDaListagem({
        busca: "  lua ",
        posicao: "MEI",
        condicao: "APTO",
        situacao: "em-clubes",
        clubeId: 3,
        idadeMinima: 20,
        idadeMaxima: 30,
        valorMinimo: 10.5,
        valorMaximo: 40,
        ordem: "value_desc",
        pagina: 2,
      }),
    ).toEqual({
      search: "lua",
      position: "MEI",
      condition: "APTO",
      free: "false",
      club_id: "3",
      min_age: "20",
      max_age: "30",
      min_value: "10.5",
      max_value: "40",
      sort: "value_desc",
      page: "2",
    });
  });

  it.each(["", "   ", "a", " é "])("busca %o (menos de 2 caracteres) não é enviada", (busca) => {
    expect(montarParametrosDaListagem({ busca })).toEqual({});
  });

  it("Livres manda free=true e deixa o clube de fora (a API recusaria os dois juntos)", () => {
    expect(montarParametrosDaListagem({ situacao: "livres", clubeId: 3 })).toEqual({
      free: "true",
    });
  });

  it("idade e valor zero são filtros, não vazios", () => {
    expect(montarParametrosDaListagem({ valorMinimo: 0, idadeMinima: 16 })).toEqual({
      min_value: "0",
      min_age: "16",
    });
  });
});
