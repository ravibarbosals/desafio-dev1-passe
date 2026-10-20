import { useQuery } from "@tanstack/react-query";
import { Download, User, X } from "lucide-react";
import { useState } from "react";

import { consultaDoHistorico, exportarHistorico, type TipoDeTransacao } from "@/api/mercado";
import { ErroDoEnvio } from "@/componentes/formulario/ErroDoEnvio";
import { Button } from "@/componentes/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";
import { useEnvio } from "@/hooks/useEnvio";
import { baixarArquivo } from "@/lib/arquivo";
import { recusadoPelaApi } from "@/lib/erro-api";

import {
  alternarTipo,
  listarJogadoresDoHistorico,
  montarFiltroDoHistorico,
  todosOsJogadores,
  todosOsTipos,
} from "./historico";
import { TabelaDoHistorico } from "./TabelaDoHistorico";
import { TotaisDoHistorico } from "./TotaisDoHistorico";

const nomesDosTipos: Record<TipoDeTransacao, string> = { COMPRA: "Compra", VENDA: "Venda" };

interface PropriedadesHistoricoDoClube {
  clubeId: number;
}

// FLX-007 (H01 a H05, E05): filtros, tabela, totais do summary e Exportar CSV com os mesmos filtros
export function HistoricoDoClube({ clubeId }: PropriedadesHistoricoDoClube) {
  const [tipos, setTipos] = useState(todosOsTipos);
  const [jogador, setJogador] = useState(todosOsJogadores);
  const filtro = montarFiltroDoHistorico(tipos, jogador);
  const filtrado = Object.keys(filtro).length > 0;
  const historico = useQuery(consultaDoHistorico(clubeId, filtro));
  // As opções vêm do histórico sem filtros: os jogadores que já passaram pelo clube (F09)
  const semFiltros = useQuery(consultaDoHistorico(clubeId));
  const jogadores = listarJogadoresDoHistorico(semFiltros.data?.data ?? []);
  // H05: jogador excluído depois de a tela abrir; a API recusa e a tela mostra o message
  const filtroRecusado = historico.isError && recusadoPelaApi(historico.error);
  const exportacao = useEnvio({
    enviar: () => exportarHistorico(clubeId, filtro),
    mensagemSucesso: (arquivo) => `CSV baixado: ${arquivo.nome}`,
    aoConcluir: (arquivo) => baixarArquivo(arquivo.nome, arquivo.conteudo, "text/csv"),
  });

  function limparFiltros() {
    setTipos(todosOsTipos);
    setJogador(todosOsJogadores);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Histórico de transações</h2>
          <p className="text-xs text-muted-foreground">
            Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          // E05: sem a lista, a exportação fica indisponível
          disabled={exportacao.isPending || (historico.isError && !filtroRecusado)}
          onClick={() => exportacao.mutate()}
        >
          <Download />
          {exportacao.isPending ? "Exportando…" : "Exportar CSV"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Tipo</span>
        {todosOsTipos.map((tipo) => (
          <label
            key={tipo}
            className="flex h-8 items-center gap-2 rounded-md border px-3 text-sm has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={tipos.includes(tipo)}
              // AM-007: o último tipo marcado não desmarca
              disabled={tipos.length === 1 && tipos.includes(tipo)}
              onChange={() => setTipos(alternarTipo(tipos, tipo))}
            />
            {nomesDosTipos[tipo]}
          </label>
        ))}
        <Select value={jogador} onValueChange={setJogador} disabled={!semFiltros.data}>
          <SelectTrigger size="sm" aria-label="Jogador">
            <User />
            <span className="text-muted-foreground">Jogador:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={todosOsJogadores}>todos</SelectItem>
            {jogadores.map(({ id, nome }) => (
              <SelectItem key={id} value={String(id)}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filtrado && (
          <Button type="button" variant="ghost" size="sm" onClick={limparFiltros}>
            <X />
            Limpar filtros
          </Button>
        )}
      </div>

      {filtroRecusado ? (
        <ErroDoEnvio erro={historico.error} tituloRecusa="O filtro foi recusado" />
      ) : (
        <TabelaDoHistorico
          transacoes={historico.data?.data}
          consulta={historico}
          filtrado={filtrado}
        />
      )}
      {historico.data && <TotaisDoHistorico resumo={historico.data.summary} />}
      <p className="text-xs text-muted-foreground">
        Os totais respeitam os filtros. O CSV usa os mesmos filtros da tela.
      </p>
    </section>
  );
}
