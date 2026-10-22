import { Plus, Swords } from "lucide-react";

import type { Formacao } from "@/api/clube";
import type { Jogador } from "@/api/jogadores";
import { iniciaisDoNome } from "@/componentes/jogadores/AvatarDoJogador";

import { nomesDosSetores, setoresDaFormacao, type Setor, type Titulares } from "./escalacao";

// Do ataque (no alto) ao goleiro (embaixo), como o campo do mockup (C06)
const linhasDoCampo: Setor[] = ["ATAQUE", "MEIO", "DEFESA", "GOL"];

interface PropriedadesEmCampo {
  formacao: Formacao;
  titulares: Titulares;
  elenco: Jogador[];
}

interface PropriedadesVaga {
  setor: Setor;
  jogador: Jogador | undefined;
}

// C06 a C11: a escolha da tela desenhada no campo, antes de salvar; vaga vazia fica tracejada
export function EmCampo({ formacao, titulares, elenco }: PropriedadesEmCampo) {
  const setores = setoresDaFormacao[formacao];

  return (
    <section className="flex flex-col gap-3 rounded-xl border p-4">
      <div>
        <h2 className="font-semibold">Em campo</h2>
        <p className="text-xs text-muted-foreground">
          Prévia da formação {formacao}, do goleiro ao ataque; as vagas vazias ficam tracejadas.
        </p>
      </div>

      <div className="relative flex h-80 flex-col justify-around overflow-hidden rounded-lg bg-emerald-800 py-4">
        <LinhasDoCampo />
        {linhasDoCampo.map((setor) => {
          const vagas = setores.flatMap((outro, indice) => (outro === setor ? [indice] : []));
          if (vagas.length === 0) {
            return null;
          }
          return (
            <div key={setor} className="relative flex justify-around">
              {vagas.map((indice) => (
                <Vaga
                  key={indice}
                  setor={setor}
                  jogador={elenco.find((jogador) => jogador.id === titulares[indice])}
                />
              ))}
            </div>
          );
        })}
      </div>

      <p className="flex gap-2 text-xs text-muted-foreground">
        <Swords className="mt-0.5 size-3.5 shrink-0" />
        Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais
        recuados. É gol quando o ataque é maior que a defesa.
      </p>
    </section>
  );
}

function Vaga({ setor, jogador }: PropriedadesVaga) {
  const ultimoNome = jogador?.name.trim().split(" ").at(-1);

  return (
    <div className="flex w-16 flex-col items-center gap-1">
      {jogador ? (
        <span className="relative flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-primary-foreground">
          {iniciaisDoNome(jogador.name)}
          {jogador.condition === "MAL_CONDICIONADO" && (
            <span
              title="Mal condicionado"
              className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-amber-500"
            />
          )}
        </span>
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-white/70 text-white/80">
          <Plus className="size-4" />
        </span>
      )}
      <span className="max-w-full truncate rounded bg-black/40 px-1.5 text-[0.625rem] text-white">
        {ultimoNome ?? nomesDosSetores[setor]}
      </span>
    </div>
  );
}

// Linhas do campo, só decoração
function LinhasDoCampo() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full text-white/30"
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      <rect x="3" y="3" width="94" height="134" />
      <line x1="3" y1="70" x2="97" y2="70" />
      <circle cx="50" cy="70" r="12" />
      <rect x="25" y="3" width="50" height="20" />
      <rect x="25" y="117" width="50" height="20" />
    </svg>
  );
}
