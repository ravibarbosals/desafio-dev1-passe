import { encontrarItemAtivo, encontrarPaginaInterna } from "../navegacao";

describe("encontrarItemAtivo", () => {
  it.each([
    ["/jogadores", "Mercado", "Jogadores"],
    ["/clubes", "Mercado", "Clubes"],
    ["/clubes/3", "Mercado", "Clubes"],
    ["/partidas/12", "Liga", "Partidas"],
    ["/classificacao", "Liga", "Classificação"],
  ])("%s → %s › %s", (caminho, secao, rotulo) => {
    expect(encontrarItemAtivo(caminho)).toMatchObject({ secao, item: { rotulo } });
  });

  it.each(["/", "/clubesx", "/caminho-que-nao-existe"])("%s fica fora do menu", (caminho) => {
    expect(encontrarItemAtivo(caminho)).toBeUndefined();
  });
});

describe("encontrarPaginaInterna", () => {
  it("acha o clube e a partida abertos, para o terceiro nível da trilha", () => {
    expect(encontrarPaginaInterna("/clubes/3")).toEqual({ tipo: "clube", id: "3" });
    expect(encontrarPaginaInterna("/partidas/12")).toEqual({ tipo: "partida", id: "12" });
  });

  it.each(["/clubes", "/partidas", "/jogadores", "/clubes/3/outra"])("%s não tem", (caminho) => {
    expect(encontrarPaginaInterna(caminho)).toBeUndefined();
  });
});
