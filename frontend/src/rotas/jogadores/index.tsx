import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpDown, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { consultaDosClubes } from "@/api/clube";
import {
  consultaDosJogadores,
  type FiltrosDosJogadores,
  type Jogador,
  type OrdemDosJogadores,
  type SituacaoDosJogadores,
} from "@/api/jogadores";
import { BarraDeFiltros } from "@/componentes/jogadores/BarraDeFiltros";
import { listarFiltrosAtivos } from "@/componentes/jogadores/filtros-ativos";
import { FiltrosAtivos } from "@/componentes/jogadores/FiltrosAtivos";
import { ModalAlterarCondicao } from "@/componentes/jogadores/ModalAlterarCondicao";
import { ModalComprarJogador } from "@/componentes/jogadores/ModalComprarJogador";
import { ModalEditarJogador } from "@/componentes/jogadores/ModalEditarJogador";
import { ModalExcluirJogador } from "@/componentes/jogadores/ModalExcluirJogador";
import { ModalNovoJogador } from "@/componentes/jogadores/ModalNovoJogador";
import { TabelaDeJogadores } from "@/componentes/jogadores/TabelaDeJogadores";
import { TituloPagina } from "@/componentes/layout/TituloPagina";
import { Button } from "@/componentes/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/componentes/ui/tabs";
import { nomesDasOrdens } from "@/lib/rotulos";

// Os filtros ficam na URL (?situacao=livres&pagina=2): sobrevivem ao recarregar e ao voltar.
// Valor estranho na URL é ignorado (catch), em vez de quebrar a tela.
const esquemaDosFiltros = z.object({
  busca: z.string().optional().catch(undefined),
  posicao: z.enum(["GOL", "LAT", "ZAG", "MEI", "ATA"]).optional().catch(undefined),
  condicao: z.enum(["APTO", "MAL_CONDICIONADO", "DOENTE"]).optional().catch(undefined),
  situacao: z.enum(["todos", "livres", "em-clubes"]).optional().catch(undefined),
  clubeId: z.number().int().min(1).optional().catch(undefined),
  idadeMinima: z.number().int().min(16).max(45).optional().catch(undefined),
  idadeMaxima: z.number().int().min(16).max(45).optional().catch(undefined),
  valorMinimo: z.number().min(0).max(550).optional().catch(undefined),
  valorMaximo: z.number().min(0).max(550).optional().catch(undefined),
  ordem: z
    .enum(["name", "value_asc", "value_desc", "age_asc", "age_desc", "position"])
    .optional()
    .catch(undefined),
  pagina: z.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/jogadores/")({
  validateSearch: esquemaDosFiltros,
  component: PaginaJogadores,
});

function PaginaJogadores() {
  const filtros = Route.useSearch();
  const navegar = Route.useNavigate();
  const jogadores = useQuery(consultaDosJogadores(filtros));
  const clubes = useQuery(consultaDosClubes());
  const [novoJogadorAberto, setNovoJogadorAberto] = useState(false);
  const [jogadorParaExcluir, setJogadorParaExcluir] = useState<Jogador>();
  const [jogadorParaEditar, setJogadorParaEditar] = useState<Jogador>();
  const [jogadorParaAlterarCondicao, setJogadorParaAlterarCondicao] = useState<Jogador>();
  const [jogadorParaComprar, setJogadorParaComprar] = useState<Jogador>();

  // Filtro novo volta para a página 1: a página atual pode não existir no resultado novo
  function mudarFiltros(novos: Partial<FiltrosDosJogadores>) {
    void navegar({ search: (atuais) => ({ ...atuais, ...novos, pagina: undefined }) });
  }

  function mudarPagina(pagina: number) {
    void navegar({ search: (atuais) => ({ ...atuais, pagina }) });
  }

  function limparFiltros() {
    void navegar({ search: {} });
  }

  const filtrosAtivos = listarFiltrosAtivos(
    filtros,
    (clubeId) => clubes.data?.find((clube) => clube.id === clubeId)?.name,
  );
  const busca = filtros.busca?.trim();

  return (
    <>
      <TituloPagina
        icone={Users}
        titulo="Jogadores"
        descricao="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
        acao={
          <Button type="button" onClick={() => setNovoJogadorAberto(true)}>
            <Plus />
            Novo jogador
          </Button>
        }
      />
      <ModalNovoJogador aberto={novoJogadorAberto} aoMudarAberto={setNovoJogadorAberto} />
      {jogadorParaEditar && (
        <ModalEditarJogador
          key={jogadorParaEditar.id}
          jogador={jogadorParaEditar}
          aoFechar={() => setJogadorParaEditar(undefined)}
        />
      )}
      {jogadorParaAlterarCondicao && (
        <ModalAlterarCondicao
          key={jogadorParaAlterarCondicao.id}
          jogador={jogadorParaAlterarCondicao}
          aoFechar={() => setJogadorParaAlterarCondicao(undefined)}
        />
      )}
      {jogadorParaComprar && (
        <ModalComprarJogador
          key={jogadorParaComprar.id}
          jogador={jogadorParaComprar}
          aoFechar={() => setJogadorParaComprar(undefined)}
          aoVerClube={(clubeId) =>
            void navegar({ to: "/clubes/$id", params: { id: String(clubeId) } })
          }
        />
      )}
      <ModalExcluirJogador
        jogador={jogadorParaExcluir}
        aoFechar={() => setJogadorParaExcluir(undefined)}
      />

      <BarraDeFiltros filtros={filtros} clubes={clubes.data} aoMudar={mudarFiltros} />
      <FiltrosAtivos
        filtros={filtrosAtivos}
        aoRemover={(filtro) => mudarFiltros(filtro.limpar)}
        aoLimparTodos={limparFiltros}
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Tabs
          value={filtros.situacao ?? "todos"}
          onValueChange={(valor) =>
            mudarFiltros({
              situacao: valor === "todos" ? undefined : (valor as SituacaoDosJogadores),
              // "Livres" desabilita o filtro de clube (J04)
              ...(valor === "livres" && { clubeId: undefined }),
            })
          }
        >
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="livres">Livres</TabsTrigger>
            <TabsTrigger value="em-clubes">Em clubes</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={filtros.ordem ?? "name"}
          onValueChange={(valor) =>
            mudarFiltros({ ordem: valor === "name" ? undefined : (valor as OrdemDosJogadores) })
          }
        >
          <SelectTrigger aria-label="Ordenar">
            <ArrowUpDown />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(nomesDasOrdens).map(([valor, nome]) => (
              <SelectItem key={valor} value={valor}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabelaDeJogadores
        consulta={jogadores}
        clubes={clubes.data}
        textoVazio={
          busca ? `Nenhum jogador encontrado para “${busca}”` : "Nenhum jogador encontrado"
        }
        acaoVazio={
          filtrosAtivos.length > 0 && (
            <Button type="button" variant="outline" onClick={limparFiltros}>
              <X />
              Limpar filtros
            </Button>
          )
        }
        aoMudarPagina={mudarPagina}
        acoes={{
          aoEditar: setJogadorParaEditar,
          aoAlterarCondicao: setJogadorParaAlterarCondicao,
          aoExcluir: setJogadorParaExcluir,
          aoComprar: setJogadorParaComprar,
        }}
      />

      <p className="mt-3 text-xs text-muted-foreground">
        Overall e valor de mercado são calculados pela API a cada consulta.
      </p>
    </>
  );
}
