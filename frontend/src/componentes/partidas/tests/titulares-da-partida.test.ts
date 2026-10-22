import type { Duelo, JogadorDoDuelo, Partida } from "@/api/partidas";

import { descreverOrdem, montarTitularesDaPartida } from "../titulares-da-partida";

function jogador(player_id: number, player_name: string, position: JogadorDoDuelo["position"]) {
  return { player_id, player_name, position, condition: "APTO" } as const;
}

function duelo(
  order: number,
  attacking_club_id: number,
  atacante: ReturnType<typeof jogador>,
  ataque: number,
  defensor: ReturnType<typeof jogador>,
  defesa: number,
): Duelo {
  return {
    order,
    attacking_club_id,
    attacker: { ...atacante, attribute: "shooting", value: ataque },
    defender: { ...defensor, attribute: "defending", value: defesa },
    goal: ataque > defesa,
  };
}

// O exemplo da RN20 no enunciado: Águias FC (1) mandante × Delta FC (2), os dois no 2-1-1
const aguias = {
  goleiro: jogador(30, "Rui Prado", "GOL"),
  primeiro: jogador(31, "Caio Reis", "ZAG"),
  segundo: jogador(32, "Davi Lins", "LAT"),
  terceiro: jogador(33, "Eno Sales", "MEI"),
  quarto: jogador(34, "Otto Rangel", "ATA"),
};
const delta = {
  goleiro: jogador(40, "Ivo Teles", "GOL"),
  primeiro: jogador(41, "Juca Mota", "ZAG"),
  segundo: jogador(42, "Lino Matos", "LAT"),
  terceiro: jogador(43, "Nei Faro", "MEI"),
  quarto: jogador(44, "Ugo Falcão", "ATA"),
};
const partida = {
  duels: [
    duelo(1, 1, aguias.quarto, 75, delta.goleiro, 72),
    duelo(2, 1, aguias.terceiro, 60, delta.primeiro, 70),
    duelo(3, 1, aguias.segundo, 63, delta.segundo, 63),
    duelo(4, 2, delta.quarto, 81, aguias.goleiro, 77),
    duelo(5, 2, delta.terceiro, 66, aguias.primeiro, 60),
    duelo(6, 2, delta.segundo, 58, aguias.segundo, 61),
  ],
} as Partida;

describe("montarTitularesDaPartida", () => {
  it("monta os 5 titulares do goleiro ao 4º, pela tabela da RN20", () => {
    const titulares = montarTitularesDaPartida(partida, 1);

    expect(titulares.map(({ ordem, jogador: { player_name } }) => [ordem, player_name])).toEqual([
      [0, "Rui Prado"],
      [1, "Caio Reis"],
      [2, "Davi Lins"],
      [3, "Eno Sales"],
      [4, "Otto Rangel"],
    ]);
  });

  it("junta o ataque e a defesa do 2º de linha, que faz os dois", () => {
    const segundo = montarTitularesDaPartida(partida, 1).find(({ ordem }) => ordem === 2);

    expect(segundo?.ataque).toEqual({ atributo: "shooting", valor: 63, gol: false });
    expect(segundo?.defesa).toBe(61);
  });

  it("marca o gol do atacante e monta o visitante pelos duelos 4 a 6", () => {
    const visitante = montarTitularesDaPartida(partida, 2);

    expect(visitante.find(({ ordem }) => ordem === 4)?.ataque?.gol).toBe(true);
    expect(visitante.find(({ ordem }) => ordem === 0)?.jogador.player_name).toBe("Ivo Teles");
  });
});

describe("descreverOrdem", () => {
  it("diz goleiro ou a posição e o número de linha", () => {
    expect(descreverOrdem(0, "GOL")).toBe("Goleiro");
    expect(descreverOrdem(4, "ATA")).toBe("ATA, 4º de linha");
  });
});
