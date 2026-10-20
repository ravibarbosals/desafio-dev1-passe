import { useQuery } from "@tanstack/react-query";
import { Lock, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";

import { consultaDaEscalacao, consultaDosClubes } from "@/api/clube";
import { alterarCondicao, type Condicao, type Jogador } from "@/api/jogadores";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { useEnvio } from "@/hooks/useEnvio";
import { formatarMoeda } from "@/lib/formatacao";
import { nomesDasCondicoes, nomesDasPosicoes } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

import { descricoesDasCondicoes, podeMudarDeCondicao, saiDaEscalacao } from "./condicao";
import { SeloDeCondicao } from "./SeloDeCondicao";

interface PropriedadesModalAlterarCondicao {
  jogador: Jogador;
  aoFechar: () => void;
}

// J10, J11, J16: PATCH /players/{id}/condition; a página monta um modal por jogador (key)
export function ModalAlterarCondicao({ jogador, aoFechar }: PropriedadesModalAlterarCondicao) {
  const [escolhida, setEscolhida] = useState<Condicao>(jogador.condition);
  // MOD-001 Frontend: GET /players/{id} não diz se é titular; jogador livre nunca é, então não consulta
  const escalacao = useQuery({
    ...consultaDaEscalacao(jogador.club_id ?? 0),
    enabled: jogador.club_id !== null,
  });
  const clubes = useQuery(consultaDosClubes());
  const alteracao = useEnvio({
    enviar: (condicao: Condicao) => alterarCondicao(jogador.id, condicao),
    // J11: o aviso mostra o valor de mercado novo, que a API recalculou
    mensagemSucesso: (alterado) =>
      `${alterado.name} agora está ${nomesDasCondicoes[alterado.condition]}. Valor de mercado: ${formatarMoeda(alterado.market_value)}.`,
    // O valor de mercado muda o elenco e o patrimônio do clube; Doente tira da escalação (RN19.5)
    invalidar: [["jogadores"], ["clubes"], ["escalacao"]],
    aoConcluir: aoFechar,
  });
  const clube = clubes.data?.find((resumo) => resumo.id === jogador.club_id);
  const avisarTitular = saiDaEscalacao(jogador, escolhida, escalacao.data?.players);

  function salvar(evento: FormEvent) {
    evento.preventDefault();
    alteracao.mutate(escolhida);
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && !alteracao.isPending && aoFechar()}>
      <DialogContent>
        <form noValidate className="flex flex-col gap-4" onSubmit={salvar}>
          <DialogHeader>
            <DialogTitle>Alterar condição física</DialogTitle>
            <DialogDescription>
              A condição muda o desconto do valor de mercado, recalculado ao salvar.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
            <div>
              <p className="font-medium">{jogador.name}</p>
              <p className="text-xs text-muted-foreground">
                {jogador.position} · {nomesDasPosicoes[jogador.position]} · {jogador.age} anos
              </p>
            </div>
            <SeloDeCondicao condicao={jogador.condition} />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Nova condição</legend>
            {(Object.keys(nomesDasCondicoes) as Condicao[]).map((condicao) => {
              const permitida = podeMudarDeCondicao(jogador.condition, condicao);
              return (
                <label
                  key={condicao}
                  className={cn(
                    "flex gap-3 rounded-lg border p-3",
                    escolhida === condicao && "border-primary bg-primary/5",
                    permitida ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name="condicao"
                    value={condicao}
                    className="mt-1 accent-primary"
                    checked={escolhida === condicao}
                    disabled={!permitida || alteracao.isPending}
                    onChange={() => setEscolhida(condicao)}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2 font-medium">
                      {nomesDasCondicoes[condicao]}
                      {condicao === jogador.condition && <Badge variant="secondary">Atual</Badge>}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {descricoesDasCondicoes[condicao]}
                    </span>
                    {!permitida && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="size-3" />
                        De Doente não passa direto para Apto.
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {avisarTitular && (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">
                  {jogador.name} é titular{clube && ` do ${clube.name}`}
                </p>
                <p>
                  Ao passar a Doente, o jogador sai da escalação, e o clube só volta a jogar
                  partidas depois de escalar de novo os 5 titulares.
                </p>
              </div>
            </div>
          )}
          {escolhida === "DOENTE" && escalacao.isError && (
            <p className="text-xs text-muted-foreground">
              Não foi possível conferir se o jogador é titular. Se for, sai da escalação.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={alteracao.isPending}
              onClick={aoFechar}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={escolhida === jogador.condition || alteracao.isPending}>
              {alteracao.isPending ? "Salvando…" : "Salvar condição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
