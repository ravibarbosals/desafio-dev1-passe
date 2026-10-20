import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "lucide-react";
import { useForm } from "react-hook-form";

import { criarClube } from "@/api/clube";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { ModalFormulario } from "@/componentes/formulario/ModalFormulario";
import { Input } from "@/componentes/ui/input";
import { useEnvio } from "@/hooks/useEnvio";
import { formatarMoeda } from "@/lib/formatacao";

import { clubeVazio, esquemaDoNovoClube } from "./esquema-do-clube";

interface PropriedadesModalNovoClube {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}

// C02, C03: POST /clubs; a recusa da API (nome ou sigla repetidos, 20 clubes) vem no message
export function ModalNovoClube({ aberto, aoMudarAberto }: PropriedadesModalNovoClube) {
  const formulario = useForm({
    resolver: zodResolver(esquemaDoNovoClube),
    defaultValues: clubeVazio,
  });
  const envio = useEnvio({
    enviar: criarClube,
    mensagemSucesso: (clube) => `${clube.name} criado com ${formatarMoeda(clube.cash)} em caixa.`,
    invalidar: [["clubes"]],
    aoConcluir: fechar,
  });
  const erros = formulario.formState.errors;

  // Ao fechar, o próximo clube começa do zero
  function fechar() {
    formulario.reset(clubeVazio);
    aoMudarAberto(false);
  }

  return (
    <ModalFormulario
      aberto={aberto}
      aoFechar={fechar}
      titulo="Novo clube"
      descricao="Informe o nome e a sigla do clube."
      aoEnviar={formulario.handleSubmit((novoClube) => envio.mutate(novoClube))}
      enviando={envio.isPending}
      textoEnviar="Criar clube"
      textoEnviando="Criando…"
    >
      <CampoFormulario id="nome-clube" rotulo="Nome" erro={erros.name?.message}>
        <Input
          id="nome-clube"
          maxLength={60}
          aria-invalid={erros.name !== undefined}
          {...formulario.register("name")}
        />
      </CampoFormulario>
      <p className="-mt-3 text-xs text-muted-foreground">
        De 3 a 60 caracteres e de 2 a 5 palavras. Não pode repetir outro clube.
      </p>

      <CampoFormulario id="sigla-clube" rotulo="Sigla" erro={erros.acronym?.message}>
        <Input
          id="sigla-clube"
          maxLength={3}
          aria-invalid={erros.acronym !== undefined}
          {...formulario.register("acronym")}
        />
      </CampoFormulario>
      <p className="-mt-3 text-xs text-muted-foreground">
        3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira
        letra do nome.
      </p>

      <p className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Wallet className="size-3.5" />O clube começa com 300,00 em caixa e sem jogadores.
      </p>
    </ModalFormulario>
  );
}