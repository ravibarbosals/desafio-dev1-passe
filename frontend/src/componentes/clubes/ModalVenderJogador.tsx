import { useQuery } from "@tanstack/react-query";
import { HandCoins, History, LoaderCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

import { consultaDaEscalacao, type JogadorDoElenco, type ResumoDoClube } from "@/api/clube";
import { venderJogador, type ResultadoDaVenda } from "@/api/mercado";
import { ErroDoEnvio } from "@/componentes/formulario/ErroDoEnvio";
import { ModalConfirmacao } from "@/componentes/formulario/ModalConfirmacao";
import { CartaoDoJogador, ValorDeMercado } from "@/componentes/jogadores/CartaoDoJogador";
import { ListaDeValores } from "@/componentes/ListaDeValores";
import { ModalResultado } from "@/componentes/ModalResultado";
import { Nota } from "@/componentes/Nota";
import { Button } from "@/componentes/ui/button";
import { ValorComSinal } from "@/componentes/ValorComSinal";
import { useEnvio } from "@/hooks/useEnvio";
import { semResposta } from "@/lib/erro-api";
import { formatarDataHora, formatarMoeda, formatarMoedaComSinal } from "@/lib/formatacao";

import { SeloDoContrato } from "../SeloDeContrato";
import { AvisoDeTitular } from "./AvisoDeTitular";
import { SeloDaMulta } from "./SeloDaMulta";
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
    avisarErro: false,
  });

  function confirmar() {
    setEraTitular(titular);
    venda.mutate();
  }

  if (resultado) {
    return (
      <ModalResultado
        titulo="Venda concluída"
        descricao={descreverVenda(resultado, eraTitular)}
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
            valor: <ValorComSinal valor={resultado.profit ?? 0} />,
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
            valor: <SeloDoContrato status={resultado.contract_status} />,
          },
          {
            rotulo: `Novo caixa do ${clube.name}`,
            valor: formatarMoeda(resultado.club_cash),
            destaque: true,
          },
        ]}
        aoFechar={aoFechar}
        acao={
          <Button type="button" variant="outline" onClick={aoVerHistorico}>
            <History />
            Ver histórico
          </Button>
        }
      />
    );
  }

  return (
    <ModalConfirmacao
      aberto
      aoMudarAberto={(aberto) => !aberto && aoFechar()}
      titulo={`Vender ${jogador.name}?`}
      descricao={`O jogador sai do elenco do ${clube.name} e volta a ficar livre.`}
      textoConfirmar={
        semResposta(venda.error) ? (
          <>
            <RefreshCw />
            Tentar de novo
          </>
        ) : (
          <>
            <HandCoins />
            Confirmar venda
          </>
        )
      }
      textoEnviando={
        <>
          <LoaderCircle className="animate-spin" />
          Vendendo…
        </>
      }
      enviando={venda.isPending}
      aoConfirmar={confirmar}
    >
      <div className="flex flex-col gap-3">
        {venda.error && (
          <ErroDoEnvio
            erro={venda.error}
            tituloRecusa="A venda foi recusada"
            textoSemConexao="A venda não foi confirmada. Verifique a conexão e tente de novo."
          />
        )}
        {titular && (
          <AvisoDeTitular nomeDoJogador={jogador.name} nomeDoClube={clube.name} acao="Ao vender" />
        )}
        <CartaoDoJogador
          jogador={jogador}
          lateral={<ValorDeMercado valor={jogador.market_value} />}
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
        {venda.isPending && (
          <Nota icone={LoaderCircle}>
            Enviando a venda. Os botões ficam desabilitados até a resposta.
          </Nota>
        )}
      </div>
    </ModalConfirmacao>
  );
}
