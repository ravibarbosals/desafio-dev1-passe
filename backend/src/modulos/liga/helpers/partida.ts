import { arredondarMeioParaCima } from '@/core/comum/arredondamento/arredondamento';
import type { Jogador, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { compararOrdemDoElenco } from '@/modulos/jogadores/helpers/ordem-do-elenco';
import type { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';

export type TitularDaPartida = Pick<Jogador, 'id' | 'nome' | 'posicao' | 'condicao' | 'finalizacao' | 'passe' | 'drible' | 'defesa'>;

export interface TimeDaPartida {
  clubeId: number;
  titulares: TitularDaPartida[];
}

// Os campos do duelo gravado, sem os da partida (o service completa partidaId)
export type DueloCalculado = Omit<DueloPartida, 'id' | 'partidaId' | 'partida' | 'clubeAtacante' | 'atacante' | 'defensor'>;

export type ResultadoDaPartida = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export interface PlacarDaPartida {
  golsMandante: number;
  golsVisitante: number;
  resultado: ResultadoDaPartida;
  duelos: DueloCalculado[];
}

// RN20.5: ATA usa finalização, MEI passe, ZAG e LAT drible; o goleiro nunca ataca
const ATRIBUTO_DE_ATAQUE: Record<Exclude<PosicaoJogador, 'GOL'>, { nome: string; campo: 'finalizacao' | 'passe' | 'drible' }> = {
  ATA: { nome: 'shooting', campo: 'finalizacao' },
  MEI: { nome: 'passing', campo: 'passe' },
  ZAG: { nome: 'dribbling', campo: 'drible' },
  LAT: { nome: 'dribbling', campo: 'drible' },
};

// RN20.4: [atacante, defensor] pela ordem do elenco (0 = goleiro, 1 a 4 = jogadores de linha do 1º ao 4º)
const CONFRONTOS = [
  [4, 0],
  [3, 1],
  [2, 2],
] as const;

// RN20.6: quem marcou mais gols; também usada na resposta das partidas gravadas, que não guardam o result
export function calcularResultado(golsMandante: number, golsVisitante: number): ResultadoDaPartida {
  if (golsMandante > golsVisitante) {
    return 'MANDANTE';
  }
  return golsVisitante > golsMandante ? 'VISITANTE' : 'EMPATE';
}

// RN20.3: MAL_CONDICIONADO joga com atributo × 0,85, meio para cima; DOENTE não chega aqui (RN19 e o 409 do service)
function aplicarCondicao(titular: TitularDaPartida, atributo: number): number {
  if (titular.condicao === 'DOENTE') {
    throw new Error(`Titular DOENTE na partida: jogador ${titular.id}`);
  }
  return titular.condicao === 'MAL_CONDICIONADO' ? arredondarMeioParaCima(atributo * 85, 100) : atributo;
}

function ordenarTitulares(time: TimeDaPartida): TitularDaPartida[] {
  const titulares = time.titulares.toSorted(compararOrdemDoElenco);
  // Na ordem do elenco, o goleiro vem primeiro: um 2º goleiro apareceria logo na posição 1
  if (titulares.length !== 5 || titulares[0].posicao !== 'GOL' || titulares[1].posicao === 'GOL') {
    throw new Error(`Escalação inválida na partida: clube ${time.clubeId}`);
  }
  return titulares;
}

function disputarDuelo(ordem: number, clubeAtacanteId: number, atacante: TitularDaPartida, defensor: TitularDaPartida): DueloCalculado {
  if (atacante.posicao === 'GOL') {
    throw new Error(`Goleiro no ataque: jogador ${atacante.id}`);
  }
  const ataque = ATRIBUTO_DE_ATAQUE[atacante.posicao];
  const valorAtaque = aplicarCondicao(atacante, atacante[ataque.campo]);
  const valorDefesa = aplicarCondicao(defensor, defensor.defesa);
  return {
    ordem,
    clubeAtacanteId,
    atacanteId: atacante.id,
    defensorId: defensor.id,
    nomeAtacante: atacante.nome,
    nomeDefensor: defensor.nome,
    posicaoAtacante: atacante.posicao,
    posicaoDefensor: defensor.posicao,
    condicaoAtacante: atacante.condicao,
    condicaoDefensor: defensor.condicao,
    atributoAtaque: ataque.nome,
    atributoDefesa: 'defending',
    valorAtaque,
    valorDefesa,
    // RN20.6: só é gol se o ataque for maior; empate não é gol
    gol: valorAtaque > valorDefesa,
  };
}

function contarGols(duelos: DueloCalculado[]): number {
  return duelos.filter((duelo) => duelo.gol).length;
}

// RN20: 3 ataques de cada time, sem sorteio; duelos 1 a 3 do mandante, 4 a 6 do visitante
export function jogarPartida(mandante: TimeDaPartida, visitante: TimeDaPartida): PlacarDaPartida {
  const titularesDoMandante = ordenarTitulares(mandante);
  const titularesDoVisitante = ordenarTitulares(visitante);
  const ataquesDoMandante = CONFRONTOS.map(([atacante, defensor], i) => disputarDuelo(i + 1, mandante.clubeId, titularesDoMandante[atacante], titularesDoVisitante[defensor]));
  const ataquesDoVisitante = CONFRONTOS.map(([atacante, defensor], i) => disputarDuelo(i + 4, visitante.clubeId, titularesDoVisitante[atacante], titularesDoMandante[defensor]));
  const golsMandante = contarGols(ataquesDoMandante);
  const golsVisitante = contarGols(ataquesDoVisitante);
  return { golsMandante, golsVisitante, resultado: calcularResultado(golsMandante, golsVisitante), duelos: [...ataquesDoMandante, ...ataquesDoVisitante] };
}
