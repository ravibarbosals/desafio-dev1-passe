import { encontrarItemAtivo } from "../navegacao";

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
