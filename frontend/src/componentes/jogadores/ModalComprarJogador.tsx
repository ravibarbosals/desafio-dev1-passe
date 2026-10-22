import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, RefreshCw, Shield, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { consultaDosClubes } from "@/api/clube";
import type { Jogador } from "@/api/jogadores";
import { comprarJogador, type NovaCompra, type ResultadoDaCompra } from "@/api/mercado";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { ErroDoEnvio } from "@/componentes/formulario/ErroDoEnvio";
import { ModalFormulario } from "@/componentes/formulario/ModalFormulario";
import { ModalResultado } from "@/componentes/ModalResultado";
import { Nota } from "@/componentes/Nota";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";
import { useEnvio } from "@/hooks/useEnvio";
import { semResposta } from "@/lib/erro-api";
import { formatarDataHora, formatarMoeda } from "@/lib/formatacao";

import { SeloDoContrato } from "../SeloDeContrato";
import { CartaoDoJogador, ValorDeMercado } from "./CartaoDoJogador";
import { calcularCustoTotal, explicarTaxa } from "./compra";
import { compraVazia, esquemaDaCompra, montarCompra } from "./esquema-da-compra";

interface PropriedadesModalComprarJogador {
  jogador: Jogador;
  aoFechar: () => void;
  aoVerClube: (clubeId: number) => void;
}

// FLX-005 (M01 a M08): clube e fim da fidelidade; recusas (50%, elenco cheio, recompra) não são
// impedidas na tela: a API responde 409 e o message aparece no modal (README, Mensagens)
export function ModalComprarJogador({
  jogador,
  aoFechar,
  aoVerClube,
}: PropriedadesModalComprarJogador) {
  const [resultado, setResultado] = useState<ResultadoDaCompra>();
  const clubes = useQuery(consultaDosClubes());
  const formulario = useForm({
    resolver: zodResolver(esquemaDaCompra),
    defaultValues: compraVazia,
  });
  const compra = useEnvio({
    enviar: (dados: NovaCompra) => comprarJogador(jogador.id, dados),
    // O jogador sai dos livres e o caixa, o elenco e o patrimônio do clube mudam (RN12, RN13)
    invalidar: [["jogadores"], ["clubes"]],
    aoConcluir: setResultado,
    avisarErro: false,
  });
  const erros = formulario.formState.errors;
  const idDoClube = useWatch({ control: formulario.control, name: "clube" });
  const clubeEscolhido = clubes.data?.find((clube) => String(clube.id) === idDoClube);

  if (resultado) {
    const comprador = clubes.data?.find((clube) => clube.id === resultado.club_id);
    return (
      <ModalResultado
        titulo="Compra concluída"
        descricao={`${resultado.player_name} agora é do ${comprador?.name ?? "clube"}.`}
        itens={[
          {
            rotulo: "Valor",
            nota: "Valor de mercado no momento da compra",
            valor: formatarMoeda(resultado.value),
          },
          { rotulo: "Taxa", nota: explicarTaxa(resultado), valor: formatarMoeda(resultado.fee) },
          {
            rotulo: "Custo total",
            nota: "Valor + taxa",
            valor: formatarMoeda(calcularCustoTotal(resultado)),
            destaque: true,
          },
          {
            rotulo: "Fim da fidelidade",
            valor: formatarDataHora(resultado.contract.loyalty_until),
          },
          {
            rotulo: "Contrato",
            valor: <SeloDoContrato status={resultado.contract.status} />,
          },
          {
            rotulo: `Novo caixa do ${comprador?.name ?? "clube"}`,
            valor: formatarMoeda(resultado.club_cash),
            destaque: true,
          },
        ]}
        aoFechar={aoFechar}
        acao={
          <Button type="button" variant="outline" onClick={() => aoVerClube(resultado.club_id)}>
            Ver clube
            <ArrowRight />
          </Button>
        }
      />
    );
  }

  return (
    <ModalFormulario
      aberto
      aoFechar={aoFechar}
      titulo="Comprar jogador"
      descricao="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      aoEnviar={formulario.handleSubmit((dados) => compra.mutate(montarCompra(dados)))}
      enviando={compra.isPending}
      // M03: sem resposta, a compra não foi confirmada, e o mesmo botão tenta de novo
      textoEnviar={
        semResposta(compra.error) ? (
          <>
            <RefreshCw />
            Tentar de novo
          </>
        ) : (
          <>
            <ShoppingCart />
            Confirmar compra
          </>
        )
      }
      textoEnviando={
        <>
          <LoaderCircle className="animate-spin" />
          Comprando…
        </>
      }
    >
      {compra.error && (
        <ErroDoEnvio
          erro={compra.error}
          tituloRecusa="Compra recusada"
          textoSemConexao="A compra não foi confirmada. Verifique a conexão e tente de novo."
        />
      )}

      <CartaoDoJogador
        jogador={jogador}
        lateral={<ValorDeMercado valor={jogador.market_value} />}
      />

      <CampoFormulario
        id="clube-compra"
        rotulo="Clube comprador"
        erro={erros.clube?.message}
        ajuda={`${clubeEscolhido ? `Caixa atual: ${formatarMoeda(clubeEscolhido.cash)}. ` : ""}O custo total (valor + taxa) pode ir até 50% do caixa.`}
      >
        <Controller
          control={formulario.control}
          name="clube"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={!clubes.data}>
              <SelectTrigger
                id="clube-compra"
                className="w-full"
                aria-invalid={erros.clube !== undefined}
              >
                <Shield />
                <SelectValue placeholder={clubes.data ? "Escolha o clube" : "Carregando clubes…"} />
              </SelectTrigger>
              <SelectContent>
                {clubes.data?.map((clube) => (
                  <SelectItem key={clube.id} value={String(clube.id)}>
                    {clube.name} ({clube.acronym}) · caixa {formatarMoeda(clube.cash)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </CampoFormulario>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Fim da fidelidade</legend>
        <div className="grid grid-cols-[1fr_8rem] gap-2">
          <CampoFormulario id="data-compra" rotulo="Data" erro={erros.data?.message}>
            <Input
              id="data-compra"
              type="date"
              aria-invalid={erros.data !== undefined}
              {...formulario.register("data")}
            />
          </CampoFormulario>
          <CampoFormulario id="hora-compra" rotulo="Hora" erro={erros.hora?.message}>
            <Input
              id="hora-compra"
              type="time"
              aria-invalid={erros.hora !== undefined}
              {...formulario.register("hora")}
            />
          </CampoFormulario>
        </div>
        <p className="text-xs text-muted-foreground">
          Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso
          (-03:00).
        </p>
      </fieldset>

      <Nota>
        A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa, custo e novo caixa
        são calculados ao confirmar.
      </Nota>
      {compra.isPending && (
        <Nota icone={LoaderCircle}>
          Enviando a compra. Os botões ficam desabilitados até a resposta.
        </Nota>
      )}
    </ModalFormulario>
  );
}
