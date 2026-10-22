import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Lock, User } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { cadastrarJogador, type Jogador } from "@/api/jogadores";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { ModalFormulario } from "@/componentes/formulario/ModalFormulario";
import { ModalResultado } from "@/componentes/ModalResultado";
import { Input } from "@/componentes/ui/input";
import { useEnvio } from "@/hooks/useEnvio";
import { formatarMoeda } from "@/lib/formatacao";
import { nomesDasPosicoes } from "@/lib/rotulos";

import {
  esquemaDoNovoJogador,
  formularioVazio,
  type FormularioDoNovoJogador,
} from "./esquema-do-jogador";
import { SeletorDePosicao } from "./SeletorDePosicao";

interface PropriedadesCampoCalculado {
  rotulo: string;
  ajuda: string;
}

type CampoNumerico = Exclude<keyof FormularioDoNovoJogador, "name" | "position">;

const atributos: { campo: CampoNumerico; rotulo: string; ajuda?: string }[] = [
  { campo: "pace", rotulo: "Velocidade" },
  { campo: "shooting", rotulo: "Finalização" },
  { campo: "passing", rotulo: "Passe" },
  { campo: "dribbling", rotulo: "Drible" },
  { campo: "defending", rotulo: "Defesa" },
  { campo: "physical", rotulo: "Físico" },
  // RN do cadastro (regras-negocio/jogadores.md): a API confere; a tela só avisa
  { campo: "potential", rotulo: "Potencial", ajuda: "≥ maior atributo; igual a ele com 33+ anos" },
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

  function campoNumerico(campo: CampoNumerico, rotulo: string, ajuda?: string) {
    return (
      <CampoFormulario
        key={campo}
        id={campo}
        rotulo={rotulo}
        erro={erros[campo]?.message}
        ajuda={ajuda}
      >
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
            nota: "Calculado no cadastro; não muda depois",
            valor: formatarMoeda(cadastrado.base_value),
            destaque: true,
          },
          {
            rotulo: "Valor de mercado",
            nota: "Com condição, agilidade e idade",
            valor: formatarMoeda(cadastrado.market_value),
          },
          {
            rotulo: "Overall",
            nota: `Pelos pesos da posição ${nomesDasPosicoes[cadastrado.position]}`,
            valor: cadastrado.overall,
          },
        ]}
        aoFechar={fechar}
      />
    );
  }

  const temErros = Object.keys(erros).length > 0;

  return (
    <ModalFormulario
      aberto={aberto}
      aoFechar={fechar}
      titulo="Novo jogador"
      descricao={
        temErros
          ? "Corrija os campos destacados para salvar."
          : "Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar."
      }
      aoEnviar={formulario.handleSubmit((novoJogador) => envio.mutate(novoJogador))}
      enviando={envio.isPending}
      textoEnviar="Salvar jogador"
      observacao={
        <span className="flex items-center gap-1.5">
          <Info className="size-3.5" />O jogador começa livre e Apto.
        </span>
      }
      className="sm:max-w-2xl"
    >
      <CampoFormulario
        id="name"
        rotulo="Nome"
        erro={erros.name?.message}
        ajuda="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
      >
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            maxLength={100}
            className="pl-8"
            aria-invalid={erros.name !== undefined}
            {...formulario.register("name")}
          />
        </div>
      </CampoFormulario>

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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {campoNumerico("age", "Idade", "De 16 a 45 anos.")}
        {campoNumerico("agility", "Agilidade", "De 1 a 100 (até 85 com 35 anos ou mais).")}
        <CampoCalculado rotulo="Valor base (moedas)" ajuda="Calculado no cadastro." />
      </div>

      <div className="border-t pt-4">
        <p className="font-medium">Indicadores técnicos</p>
        <p className="text-xs text-muted-foreground">
          Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro; a soma dos seis
          atributos não pode passar de 480.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {atributos.map(({ campo, rotulo, ajuda }) => campoNumerico(campo, rotulo, ajuda))}
        <CampoCalculado rotulo="Overall" ajuda="Calculado automaticamente" />
      </div>
    </ModalFormulario>
  );
}

// J05: o que a API calcula aparece travado no formulário, com "Após salvar"
function CampoCalculado({ rotulo, ajuda }: PropriedadesCampoCalculado) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-muted-foreground">{rotulo}</p>
      <p className="flex h-9 items-center gap-2 rounded-md border bg-muted px-3 text-sm text-muted-foreground">
        <Lock className="size-3.5" />
        Após salvar
      </p>
      <p className="text-xs text-muted-foreground">{ajuda}</p>
    </div>
  );
}
