import { useQuery } from "@tanstack/react-query";
import { CircleCheck, History, Info } from "lucide-react";
import { useState } from "react";

import { consultaDaEscalacao, type JogadorDoElenco, type ResumoDoClube } from "@/api/clube";
import { venderJogador, type ResultadoDaVenda } from "@/api/mercado";
import { ModalConfirmacao } from "@/componentes/formulario/ModalConfirmacao";
import { CartaoDoJogador } from "@/componentes/jogadores/CartaoDoJogador";
import { ListaDeValores } from "@/componentes/ListaDeValores";
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
import { formatarDataHora, formatarMoeda, formatarMoedaComSinal } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

import { AvisoDeTitular } from "./AvisoDeTitular";
import { SeloDaMulta } from "./SeloDaMuta";
import { descreverVenda, explicarComissao, explicarMulta } from "./venda";

interface PropriedadesModalVenderJogador {
  jogador: JogadorDoElenco;
  clube: Pick<ResumoDoClube, "id" | "name">;
  aoFechar: () => void;
  aoVerHistorico: () => void;
}

// FLX-005 (V01 a V05): confirmação com o contrato, depois o resultado que a API calculou (F08)
export function ModalVenderJogador({
  jogador,
  clube,
  aoFechar,
  aoVerHistorico,
}: PropriedadesModalVenderJogador) {
  const [resultado, setResultado] = useState<ResultadoDaVenda>();
  // Guardado no clique: depois da venda a escalação é recarregada, já sem o jogador
  const [eraTitular, setEraTitular] = useState(false);
  const escalacao = useQuery(consultaDaEscalacao(clube.id));
  const titular = escalacao.data?.players.some((escalado) => escalado.id === jogador.id) ?? false;
  const venda = useEnvio({
    enviar: () => venderJogador(jogador.id),
    // O caixa, o elenco, a lista de livres e a escalação mudam (RN16, RN19.5)
    invalidar: [["clubes"], ["jogadores"], ["escalacao"]],
    aoConcluir: setResultado,
  });

  function confirmar() {
    setEraTitular(titular);
    venda.mutate();
  }

  if (resultado) {
    const lucro = resultado.profit ?? 0;
    return (
      <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
        <DialogContent>
          <DialogHeader>
            <CircleCheck className="size-6 text-green-600" />
            <DialogTitle>Venda concluída</DialogTitle>
            <DialogDescription>{descreverVenda(resultado, eraTitular)}</DialogDescription>
          </DialogHeader>
          <ListaDeValores
            itens={[
              { rotulo: "Valor de compra", valor: formatarMoeda(resultado.purchase_value) },
              {
                rotulo: "Valor de venda",
                nota: "Valor de mercado no momento da venda",
                valor: formatarMoeda(resultado.value),
              },
              { rotulo: "Dias restantes", valor: resultado.remaining_days },
              {
                rotulo: "Multa",
                nota: explicarMulta(resultado),
                valor: formatarMoeda(resultado.penalty),
              },
              {
                rotulo: "Lucro",
                valor: (
                  <span
                    className={cn(lucro > 0 && "text-green-700", lucro < 0 && "text-destructive")}
                  >
                    {formatarMoedaComSinal(lucro)}
                  </span>
                ),
              },
              {
                rotulo: "Comissão",
                nota: explicarComissao(resultado),
                valor: formatarMoeda(resultado.fee),
              },
              {
                rotulo: "Crédito no caixa",
                nota: "Valor de venda − multa − comissão",
                valor: formatarMoedaComSinal(resultado.cash_change),
                destaque: true,
              },
              {
                rotulo: "Contrato",
                valor: <Badge variant="outline">{resultado.contract_status}</Badge>,
              },
              {
                rotulo: `Novo caixa do ${clube.name}`,
                valor: formatarMoeda(resultado.club_cash),
                destaque: true,
              },
            ]}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={aoVerHistorico}>
              <History />
              Ver histórico
            </Button>
            <Button type="button" onClick={aoFechar}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ModalConfirmacao
      aberto
      aoMudarAberto={(aberto) => !aberto && aoFechar()}
      titulo={`Vender ${jogador.name}?`}
      descricao={`O jogador sai do elenco do ${clube.name} e volta a ficar livre.`}
      textoConfirmar="Confirmar venda"
      textoEnviando="Vendendo…"
      enviando={venda.isPending}
      aoConfirmar={confirmar}
    >
      <div className="flex flex-col gap-3">
        {titular && (
          <AvisoDeTitular nomeDoJogador={jogador.name} nomeDoClube={clube.name} acao="Ao vender" />
        )}
        <CartaoDoJogador
          jogador={jogador}
          lateral={
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valor de mercado</p>
              <p className="font-semibold">{formatarMoeda(jogador.market_value)}</p>
            </div>
          }
        />
        <ListaDeValores
          itens={[
            { rotulo: "Valor de compra", valor: formatarMoeda(jogador.contract.purchase_value) },
            {
              rotulo: "Fim da fidelidade",
              valor: formatarDataHora(jogador.contract.loyalty_until),
            },
            { rotulo: "Dias restantes", valor: jogador.contract.remaining_days },
            {
              rotulo: "% de multa se vender agora",
              valor: <SeloDaMulta percentual={jogador.contract.penalty_rate} />,
            },
          ]}
        />
        <p className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          A venda é pelo valor de mercado do momento. Multa (teto de 10,00), lucro, comissão e
          crédito são calculados ao confirmar.
        </p>
      </div>
    </ModalConfirmacao>
  );
}
