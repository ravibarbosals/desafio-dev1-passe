import type { Posicao } from "@/api/jogadores";
import type { AtributoDoDuelo, Duelo, JogadorDoDuelo, Partida } from "@/api/partidas";

// RN20 (enunciado, "Quem ataca e quem defende"): no 1º, 2º e 3º duelo de cada lado, atacam o 4º,
// o 3º e o 2º jogador de linha e defendem o goleiro (0), o 1º e o 2º do adversário
export const ordemDoAtacante = [4, 3, 2];
export const ordemDoDefensor = [0, 1, 2];

export interface TitularNaPartida {
  jogador: JogadorDoDuelo;
  // 0 é o goleiro; 1 a 4, os jogadores de linha do mais recuado ao mais avançado
  ordem: number;
  ataque?: { atributo: AtributoDoDuelo; valor: number; gol: boolean };
  defesa?: number;
}

// "Goleiro" ou "ATA, 4º de linha", como nos duelos do mockup (L03)
export function descreverOrdem(ordem: number, posicao: Posicao): string {
  return ordem === 0 ? "Goleiro" : `${posicao}, ${ordem}º de linha`;
}

function duelosDoLado(partida: Partida, clubeId: number, atacando: boolean): Duelo[] {
  return partida.duels
    .filter((duelo) => (duelo.attacking_club_id === clubeId) === atacando)
    .toSorted((a, b) => a.order - b.order);
}

// Os 5 titulares de um clube, montados dos 6 duelos gravados (a API não devolve a escalação da
// partida); o 2º de linha aparece uma vez só, com o ataque e a defesa
export function montarTitularesDaPartida(partida: Partida, clubeId: number): TitularNaPartida[] {
  const porOrdem = new Map<number, TitularNaPartida>();

  function titular(ordem: number, jogador: JogadorDoDuelo): TitularNaPartida {
    const existente = porOrdem.get(ordem);
    if (existente) {
      return existente;
    }
    const novo = { jogador, ordem };
    porOrdem.set(ordem, novo);
    return novo;
  }

  duelosDoLado(partida, clubeId, true).forEach((duelo, indice) => {
    titular(ordemDoAtacante[indice], duelo.attacker).ataque = {
      atributo: duelo.attacker.attribute,
      valor: duelo.attacker.value,
      gol: duelo.goal,
    };
  });
  duelosDoLado(partida, clubeId, false).forEach((duelo, indice) => {
    titular(ordemDoDefensor[indice], duelo.defender).defesa = duelo.defender.value;
  });

  return [...porOrdem.values()].toSorted((a, b) => a.ordem - b.ordem);
}
