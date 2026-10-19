import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { cadastrarJogador, type Jogador } from "@/api/jogadores";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { Button } from "@/componentes/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { Input } from "@/componentes/ui/input";
import { useEnvio } from "@/hooks/useEnvio";
import { formatarMoeda } from "@/lib/formatacao";
import { nomesDasPosicoes } from "@/lib/rotulos";

import {
  esquemaDoNovoJogador,
  formularioVazio,
  type FormularioDoNovoJogador,
} from "./esquema-do-jogador";

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
  function mudarAberto(valor: boolean) {
    if (envio.isPending) {
      return;
    }
    if (!valor) {
      formulario.reset(formularioVazio);
      setCadastrado(undefined);
    }
    aoMudarAberto(valor);
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

  return (
    <Dialog open={aberto} onOpenChange={mudarAberto}>
      <DialogContent className="sm:max-w-2xl">
        {cadastrado ? (
          <>
            <DialogHeader>
              <CircleCheck className="size-6 text-green-600" />
              <DialogTitle>Jogador cadastrado</DialogTitle>
              <DialogDescription>
                {cadastrado.name} entrou livre e Apto. Valores em moedas, calculados pela API ao
                salvar.
              </DialogDescription>
            </DialogHeader>
            <dl className="divide-y rounded-lg border text-sm">
              <div className="flex justify-between p-3">
                <dt>Valor base</dt>
                <dd className="font-semibold">{formatarMoeda(cadastrado.base_value)}</dd>
              </div>
              <div className="flex justify-between p-3">
                <dt>Valor de mercado</dt>
                <dd>{formatarMoeda(cadastrado.market_value)}</dd>
              </div>
              <div className="flex justify-between p-3">
                <dt>Overall</dt>
                <dd>{cadastrado.overall}</dd>
              </div>
            </dl>
            <DialogFooter>
              <Button type="button" onClick={() => mudarAberto(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={formulario.handleSubmit((novoJogador) => envio.mutate(novoJogador))}
          >
            <DialogHeader>
              <DialogTitle>Novo jogador</DialogTitle>
              <DialogDescription>
                O valor base, o overall e o valor de mercado são calculados ao salvar.
              </DialogDescription>
            </DialogHeader>

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
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="mb-1.5 text-sm font-medium">Posição</legend>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(nomesDasPosicoes).map(([sigla, nome]) => (
                      <Button
                        key={sigla}
                        type="button"
                        variant={field.value === sigla ? "default" : "outline"}
                        aria-pressed={field.value === sigla}
                        onClick={() => field.onChange(sigla)}
                      >
                        {sigla} · {nome}
                      </Button>
                    ))}
                  </div>
                  {erros.position && (
                    <p className="text-sm text-destructive">{erros.position.message}</p>
                  )}
                </fieldset>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              {campoNumerico("age", "Idade")}
              {campoNumerico("agility", "Agilidade")}
            </div>

            <div>
              <p className="text-sm font-medium">Indicadores técnicos</p>
              <p className="text-xs text-muted-foreground">
                De 1 a 99; não mudam depois do cadastro. A soma dos seis atributos não pode passar
                de 480, e o potencial não pode ser menor que o maior deles.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {atributos.map(({ campo, rotulo }) => campoNumerico(campo, rotulo))}
            </div>

            <DialogFooter className="items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">O jogador começa livre e Apto.</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={envio.isPending}
                  onClick={() => mudarAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={envio.isPending}>
                  {envio.isPending ? "Salvando…" : "Salvar jogador"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
