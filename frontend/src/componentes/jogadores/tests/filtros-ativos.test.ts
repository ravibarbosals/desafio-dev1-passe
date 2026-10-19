import { listarFiltrosAtivos } from "../filtros-ativos";

const nomeDoClube = (clubeId: number) => (clubeId === 1 ? "Águias FC" : undefined);

describe("listarFiltrosAtivos", () => {
  it("sem filtro, nenhuma etiqueta; aba, ordem e página não contam", () => {
    expect(
      listarFiltrosAtivos({ situacao: "livres", ordem: "value_desc", pagina: 2 }, nomeDoClube),
    ).toEqual([]);
  });

  it("uma etiqueta por filtro, com os nomes da tela (J02)", () => {
    const ativos = listarFiltrosAtivos(
      {
        busca: " joao ",
        posicao: "MEI",
        condicao: "MAL_CONDICIONADO",
        clubeId: 1,
        idadeMinima: 18,
        idadeMaxima: 30,
        valorMinimo: 10,
        valorMaximo: 60,
      },
      nomeDoClube,
    );
    expect(ativos.map((filtro) => filtro.rotulo)).toEqual([
      "Busca: joao",
      "Posição: Meio-campo",
      "Condição: Mal condicionado",
      "Clube: Águias FC",
      "Idade: 18 a 30",
      "Valor de mercado: 10,00 a 60,00",
    ]);
  });

  it("busca com menos de 2 caracteres não filtra, então não vira etiqueta", () => {
    expect(listarFiltrosAtivos({ busca: " a " }, nomeDoClube)).toEqual([]);
  });

  it("faixa com um lado só", () => {
    const ativos = listarFiltrosAtivos({ idadeMinima: 18, valorMaximo: 40.5 }, nomeDoClube);
    expect(ativos.map((filtro) => filtro.rotulo)).toEqual([
      "Idade: a partir de 18",
      "Valor de mercado: até 40,50",
    ]);
  });

  it("o x da faixa limpa os dois lados", () => {
    const [idade] = listarFiltrosAtivos({ idadeMinima: 18, idadeMaxima: 30 }, nomeDoClube);
    expect(idade.limpar).toEqual({ idadeMinima: undefined, idadeMaxima: undefined });
  });

  it("clube que a lista de clubes ainda não trouxe aparece pelo id", () => {
    const [clube] = listarFiltrosAtivos({ clubeId: 9 }, nomeDoClube);
    expect(clube.rotulo).toBe("Clube: #9");
  });
});
