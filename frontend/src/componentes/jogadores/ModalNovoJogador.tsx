import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { cadastrarJogador, type Jogador } from "@/api/jogadores";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { ModalFormulario } from "@/componentes/formulario/ModalFormulario";
import { ModalResultado } from "@/componentes/ModalResultado";
import { Input } from "@/componentes/ui/input";
import { useEnvio } from "@/hooks/useEnvio";
import { formatarMoeda } from "@/lib/formatacao";

import {
  esquemaDoNovoJogador,
  formularioVazio,
  type FormularioDoNovoJogador,
} from "./esquema-do-jogador";
import { SeletorDePosicao } from "./SeletorDePosicao";

type CampoNumerico = Exclude<keyof FormularioDoNovoJogador, "name" | "position">;

const atributos: { campo: CampoNumerico; rotulo: string }[] = [
  { campo: "pace", rotulo: "Velocidade" },
  { campo: "shooting", rotulo: "Finalização" },
  { campo: "passing", rotulo: "Passe" },
  { campo: "dribbling", rotulo: "Drible" },
  { campo: "defending", rotulo: "Defesa" },
  { campo: "physical", rotulo: "Físico" },
  { campo: "potential", rotulo: "Potencial" },
];

interface PropriedadesModalNovoJogador {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}

// FLX-001 (J05 a J07): formulário, validação junto ao campo e o resultado calculado pela API
export function ModalNovoJogador({ aberto, aoMudarAberto }: PropriedadesModalNovoJogador) {
  const [cadastrado, setCadastrado] = useState<Jogador>();
  const formulario = useForm({
    resolver: zodResolver(esquemaDoNovoJogador),
    defaultValues: formularioVazio,
  });
  const envio = useEnvio({
    enviar: cadastrarJogador,
    invalidar: [["jogadores"]],
    aoConcluir: setCadastrado,
  });
  const erros = formulario.formState.errors;

  // Ao fechar, o próximo cadastro começa do zero
  function fechar() {
    formulario.reset(formularioVazio);
    setCadastrado(undefined);
    aoMudarAberto(false);
  }

  function campoNumerico(campo: CampoNumerico, rotulo: string) {
    return (
      <CampoFormulario key={campo} id={campo} rotulo={rotulo} erro={erros[campo]?.message}>
        <Input
          id={campo}
          inputMode="numeric"
          aria-invalid={erros[campo] !== undefined}
          {...formulario.register(campo)}
        />
      </CampoFormulario>
    );
  }

  // J07: depois de salvar, o modal troca o formulário pelo resultado calculado pela API
  if (cadastrado) {
    return (
      <ModalResultado
        titulo="Jogador cadastrado"
        descricao={`${cadastrado.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`}
        itens={[
          {
            rotulo: "Valor base",
            valor: <span className="font-semibold">{formatarMoeda(cadastrado.base_value)}</span>,
          },
          { rotulo: "Valor de mercado", valor: formatarMoeda(cadastrado.market_value) },
          { rotulo: "Overall", valor: cadastrado.overall },
        ]}
        aoFechar={fechar}
      />
    );
  }

  return (
    <ModalFormulario
      aberto={aberto}
      aoFechar={fechar}
      titulo="Novo jogador"
      descricao="O valor base, o overall e o valor de mercado são calculados ao salvar."
      aoEnviar={formulario.handleSubmit((novoJogador) => envio.mutate(novoJogador))}
      enviando={envio.isPending}
      textoEnviar="Salvar jogador"
      observacao="O jogador começa livre e Apto."
      className="sm:max-w-2xl"
    >
      <CampoFormulario id="name" rotulo="Nome" erro={erros.name?.message}>
        <Input
          id="name"
          maxLength={100}
          aria-invalid={erros.name !== undefined}
          {...formulario.register("name")}
        />
      </CampoFormulario>
      <p className="-mt-3 text-xs text-muted-foreground">
        De 3 a 100 caracteres, com pelo menos duas palavras e sem números.
      </p>

      <Controller
        control={formulario.control}
        name="position"
        render={({ field }) => (
          <SeletorDePosicao
            valor={field.value}
            aoMudar={field.onChange}
            erro={erros.position?.message}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        {campoNumerico("age", "Idade")}
        {campoNumerico("agility", "Agilidade")}
      </div>

      <div>
        <p className="text-sm font-medium">Indicadores técnicos</p>
        <p className="text-xs text-muted-foreground">
          De 1 a 99; não mudam depois do cadastro. A soma dos seis atributos não pode passar de 480,
          e o potencial não pode ser menor que o maior deles.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {atributos.map(({ campo, rotulo }) => campoNumerico(campo, rotulo))}
      </div>
    </ModalFormulario>
  );
}
