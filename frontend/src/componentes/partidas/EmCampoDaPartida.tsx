import { ArrowLeft, ArrowRight, Goal } from "lucide-react";

import type { LadoDaPartida, Partida } from "@/api/partidas";
import { setoresDaFormacao, type Setor } from "@/componentes/clubes/escalacao";
import { iniciaisDoNome } from "@/componentes/jogadores/AvatarDoJogador";
import { nomesDosAtributos } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

import { montarTitularesDaPartida, type TitularNaPartida } from "./titulares-da-partida";

interface PropriedadesEmCampoDaPartida {
  partida: Partida;
}

interface PropriedadesTime {
  lado: LadoDaPartida;
  partida: Partida;
  mandante: boolean;
}

interface PropriedadesJogador {
  titular: TitularNaPartida;
  mandante: boolean;
  // Posição no campo, em % da largura e da altura
  x: number;
  y: number;
}

// Distância de cada setor até a linha de fundo do próprio time, em % da largura do campo (L03)
const colunaDoSetor: Record<Setor, number> = { GOL: 8, DEFESA: 19, MEIO: 30, ATAQUE: 41 };

// L03 (DEC-071): os titulares gravados de cada clube na formação da partida, com os valores dos
// duelos; o mandante ataca para a direita e o visitante para a esquerda
export function EmCampoDaPartida({ partida }: PropriedadesEmCampoDaPartida) {
  return (
    <section className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">Em campo</h2>
          <p className="text-xs text-muted-foreground">
            Titulares de cada clube na formação da partida e os valores usados nos duelos, já com o
            efeito da condição.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            Mal condicionado
          </span>
          <span className="flex items-center gap-1.5">
            <Goal className="size-3.5" />
            Gol no duelo
          </span>
        </div>
      </div>

      {/* Proporção fixa (2:1): o desenho não entorta, e em tela estreita o campo rola de lado */}
      <div className="overflow-x-auto p-4">
        <div className="relative mx-auto aspect-[2/1] w-full max-w-4xl min-w-[52rem] overflow-hidden rounded-lg bg-emerald-800">
          <LinhasDoCampo />
          <Time lado={partida.home} partida={partida} mandante />
          <Time lado={partida.away} partida={partida} mandante={false} />
        </div>
      </div>
    </section>
  );
}

function Time({ lado, partida, mandante }: PropriedadesTime) {
  const titulares = montarTitularesDaPartida(partida, lado.club_id);
  const setores = setoresDaFormacao[lado.formation];
  const Seta = mandante ? ArrowRight : ArrowLeft;

  return (
    <>
      <p
        className={cn(
          "absolute top-2 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white",
          mandante ? "left-2" : "right-2",
        )}
      >
        <span className={cn("size-2 rounded-full", mandante ? "bg-primary" : "bg-white")} />
        {lado.club_name} · {lado.formation} · ataca
        <Seta className="size-3" />
      </p>
      {titulares.map((titular) => {
        const setor = setores[titular.ordem];
        // Os do mesmo setor se espalham na vertical: 1 no meio, 2 em 1/3 e 2/3, 3 em 1/4…
        const doSetor = titulares.filter(({ ordem }) => setores[ordem] === setor);
        const posicao = doSetor.indexOf(titular) + 1;
        const x = mandante ? colunaDoSetor[setor] : 100 - colunaDoSetor[setor];
        return (
          <Jogador
            key={titular.ordem}
            titular={titular}
            mandante={mandante}
            x={x}
            y={(posicao / (doSetor.length + 1)) * 100}
          />
        );
      })}
    </>
  );
}

// "LAT · Dri 75 · Def 63": o atributo do ataque e a defesa, abreviados
function Jogador({ titular: { jogador, ataque, defesa }, mandante, x, y }: PropriedadesJogador) {
  const valores = [
    ataque && `${nomesDosAtributos[ataque.atributo].slice(0, 3)} ${ataque.valor}`,
    defesa !== undefined && `Def ${defesa}`,
  ].filter(Boolean);

  return (
    <div
      className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold shadow",
          mandante ? "bg-primary text-primary-foreground" : "bg-white text-foreground",
        )}
      >
        {iniciaisDoNome(jogador.player_name)}
        {jogador.condition === "MAL_CONDICIONADO" && (
          <span
            title="Mal condicionado"
            className="absolute -top-1 -left-1 size-3 rounded-full border-2 border-white bg-amber-500"
          />
        )}
        {ataque?.gol && (
          <Goal
            aria-label="Gol no duelo"
            className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-white p-0.5 text-foreground"
          />
        )}
      </span>
      <span className="rounded bg-black/50 px-1.5 text-[0.625rem] leading-4 text-white">
        {jogador.player_name}
        <span className="block text-white/70">{[jogador.position, ...valores].join(" · ")}</span>
      </span>
    </div>
  );
}

// Linhas do campo na proporção 2:1, só decoração
function LinhasDoCampo() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full text-white/30"
      viewBox="0 0 200 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      <rect x="3" y="3" width="194" height="94" />
      <line x1="100" y1="3" x2="100" y2="97" />
      <circle cx="100" cy="50" r="12" />
      <rect x="3" y="25" width="26" height="50" />
      <rect x="171" y="25" width="26" height="50" />
      <rect x="3" y="38" width="9" height="24" />
      <rect x="188" y="38" width="9" height="24" />
    </svg>
  );
}
