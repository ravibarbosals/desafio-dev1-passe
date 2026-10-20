import type { Jogador, Posicao } from "@/api/jogadores";

import {
  distribuirTitulares,
  listarAtributosUsados,
  listarOpcoesDaVaga,
  montarEscalacao,
} from "../escalacao";

function jogador(id: number, position: Posicao, condition: Jogador["condition"] = "APTO"): Jogador {
  return {
    id,
    name: `Jogador ${id}`,
    position,
    agility: 50,
    age: 25,
    condition,
    base_value: 50,
    market_value: 50,
    pace: 60,
    shooting: 75,
    passing: 82,
    dribbling: 74,
    defending: 66,
    physical: 60,
    potential: 70,
    overall: 70,
    club_id: 1,
  };
}

// Elenco na ordem da RN11: GOL, ZAG, LAT, MEI, ATA
const elenco = [
  jogador(30, "GOL"),
  jogador(32, "ZAG"),
  jogador(31, "LAT"),
  jogador(35, "LAT", "DOENTE"),
  jogador(33, "MEI"),
  jogador(34, "ATA"),
];

describe("distribuirTitulares", () => {
  it("põe a escalação salva nas vagas da formação (E 2.4.1)", () => {
    const salva = [elenco[0], elenco[1], elenco[2], elenco[4], elenco[5]];
    expect(distribuirTitulares("2-1-1", salva)).toEqual([30, 32, 31, 33, 34]);
  });

  it("deixa vazia a vaga do titular que saiu (C11)", () => {
    const semZagueiro = [elenco[0], elenco[2], elenco[4], elenco[5]];
    expect(distribuirTitulares("2-1-1", semZagueiro)).toEqual([30, 31, undefined, 33, 34]);
  });

  it("na troca de formação, quem não cabe sai (3-1 não tem meio)", () => {
    const escolhidos = [elenco[0], elenco[1], elenco[2], elenco[4], elenco[5]];
    expect(distribuirTitulares("3-1", escolhidos)).toEqual([30, 32, 31, undefined, 34]);
  });
});

describe("listarOpcoesDaVaga", () => {
  it("defesa aceita ZAG e LAT, sem DOENTE e sem quem está em outra vaga", () => {
    const titulares = [30, 32, undefined, 33, 34];
    const opcoes = listarOpcoesDaVaga(elenco, titulares, 2, "2-1-1");
    expect(opcoes.map((opcao) => opcao.id)).toEqual([31]);
  });

  it("a própria vaga mantém o escolhido entre as opções", () => {
    const opcoes = listarOpcoesDaVaga(elenco, [30, 32, 31, 33, 34], 1, "2-1-1");
    expect(opcoes.map((opcao) => opcao.id)).toEqual([32]);
  });
});

describe("montarEscalacao", () => {
  it("monta o corpo do PUT com as 5 vagas preenchidas", () => {
    expect(montarEscalacao("2-1-1", [30, 32, 31, 33, 34])).toEqual({
      formation: "2-1-1",
      player_ids: [30, 32, 31, 33, 34],
    });
  });

  it("não monta com vaga vazia (o Salvar fica desabilitado)", () => {
    expect(montarEscalacao("2-1-1", [30, undefined, 31, 33, 34])).toBeUndefined();
  });
});

describe("listarAtributosUsados", () => {
  it("o atributo de ataque pela posição e a defesa (RN20)", () => {
    expect(listarAtributosUsados(elenco[0])).toEqual([{ nome: "Defesa", valor: 66 }]);
    expect(listarAtributosUsados(elenco[2])).toEqual([
      { nome: "Drible", valor: 74 },
      { nome: "Defesa", valor: 66 },
    ]);
    expect(listarAtributosUsados(elenco[4])).toEqual([{ nome: "Passe", valor: 82 }]);
    expect(listarAtributosUsados(elenco[5])).toEqual([{ nome: "Finalização", valor: 75 }]);
  });
});
