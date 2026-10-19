import { Search } from "lucide-react";
import { useRef, useState } from "react";

import type { ResumoDoClube } from "@/api/clube";
import type { Condicao, FiltrosDosJogadores, Posicao } from "@/api/jogadores";
import { Input } from "@/componentes/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";
import { nomesDasCondicoes, nomesDasPosicoes } from "@/lib/rotulos";

// O Select do Radix não aceita valor vazio: "todos" quer dizer sem filtro
const semFiltro = "todos";
// Espera a pessoa parar de digitar para não pedir uma lista a cada letra
const esperaDaBusca = 400;

interface PropriedadesBarraDeFiltros {
  filtros: FiltrosDosJogadores;
  clubes: ResumoDoClube[] | undefined;
  aoMudar: (novos: Partial<FiltrosDosJogadores>) => void;
}

export function BarraDeFiltros({ filtros, clubes, aoMudar }: PropriedadesBarraDeFiltros) {
  const clubeDesabilitado = filtros.situacao === "livres";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border p-2">
      <CampoDeBusca valor={filtros.busca} aoMudar={(busca) => aoMudar({ busca })} />

      <Select
        value={filtros.posicao ?? semFiltro}
        onValueChange={(valor) =>
          aoMudar({ posicao: valor === semFiltro ? undefined : (valor as Posicao) })
        }
      >
        <SelectTrigger aria-label="Posição" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={semFiltro}>Todas as posições</SelectItem>
          {Object.entries(nomesDasPosicoes).map(([valor, nome]) => (
            <SelectItem key={valor} value={valor}>
              {nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filtros.condicao ?? semFiltro}
        onValueChange={(valor) =>
          aoMudar({ condicao: valor === semFiltro ? undefined : (valor as Condicao) })
        }
      >
        <SelectTrigger aria-label="Condição" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={semFiltro}>Todas as condições</SelectItem>
          {Object.entries(nomesDasCondicoes).map(([valor, nome]) => (
            <SelectItem key={valor} value={valor}>
              {nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* J04: "Livres" não combina com o filtro por clube (a API responde 400) */}
      <span title={clubeDesabilitado ? "“Livres” não combina com o filtro por clube." : undefined}>
        <Select
          value={filtros.clubeId?.toString() ?? semFiltro}
          disabled={clubeDesabilitado}
          onValueChange={(valor) =>
            aoMudar({ clubeId: valor === semFiltro ? undefined : Number(valor) })
          }
        >
          <SelectTrigger aria-label="Clube" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={semFiltro}>Todos os clubes</SelectItem>
            {clubes?.map((clube) => (
              <SelectItem key={clube.id} value={clube.id.toString()}>
                {clube.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
    </div>
  );
}

interface PropriedadesCampoDeBusca {
  valor: string | undefined;
  aoMudar: (busca: string | undefined) => void;
}

function CampoDeBusca({ valor, aoMudar }: PropriedadesCampoDeBusca) {
  const [texto, setTexto] = useState(valor ?? "");
  const [valorAnterior, setValorAnterior] = useState(valor);
  const temporizador = useRef<number | undefined>(undefined);

  // A busca mudou por fora (etiqueta removida, "Limpar filtros"): o campo acompanha
  if (valor !== valorAnterior) {
    setValorAnterior(valor);
    setTexto(valor ?? "");
  }

  function digitar(novo: string) {
    setTexto(novo);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(
      () => aoMudar(novo === "" ? undefined : novo),
      esperaDaBusca,
    );
  }

  return (
    <div className="relative min-w-56 flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label="Buscar por nome"
        placeholder="Buscar por nome"
        maxLength={100}
        className="pl-8"
        value={texto}
        onChange={(evento) => digitar(evento.target.value)}
      />
    </div>
  );
}
