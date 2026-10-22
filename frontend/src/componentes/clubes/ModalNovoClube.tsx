import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Shield, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";

import { criarClube } from "@/api/clube";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { ErroDoEnvio } from "@/componentes/formulario/ErroDoEnvio";
import { ModalFormulario } from "@/componentes/formulario/ModalFormulario";
import { Input } from "@/componentes/ui/input";
import { useEnvio } from "@/hooks/useEnvio";
import { formatarMoeda } from "@/lib/formatacao";

import { clubeVazio, esquemaDoNovoClube } from "./esquema-do-clube";

interface PropriedadesModalNovoClube {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}

// C02 a C04: POST /clubs; a recusa da API (nome ou sigla repetidos, 20 clubes) aparece no modal,
// e o clube criado abre na página dele
export function ModalNovoClube({ aberto, aoMudarAberto }: PropriedadesModalNovoClube) {
  const navegar = useNavigate();
  const formulario = useForm({
    resolver: zodResolver(esquemaDoNovoClube),
    defaultValues: clubeVazio,
  });
  const envio = useEnvio({
    enviar: criarClube,
    mensagemSucesso: (clube) => ({
      titulo: "Clube criado",
      descricao: `${clube.name} (${clube.acronym}) começa com ${formatarMoeda(clube.cash)} em caixa.`,
    }),
    invalidar: [["clubes"]],
    aoConcluir: (clube) => {
      fechar();
      void navegar({ to: "/clubes/$id", params: { id: String(clube.id) } });
    },
    avisarErro: false,
  });
  const erros = formulario.formState.errors;

  // Ao fechar, o próximo clube começa do zero, sem a recusa anterior
  function fechar() {
    formulario.reset(clubeVazio);
    envio.reset();
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
      {envio.error && (
        <ErroDoEnvio
          erro={envio.error}
          tituloRecusa="Não foi possível criar o clube"
          textoSemConexao="O clube não foi criado. Verifique a conexão e tente de novo."
        />
      )}

      <CampoFormulario
        id="nome-clube"
        rotulo="Nome"
        erro={erros.name?.message}
        ajuda="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
      >
        <div className="relative">
          <Shield className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="nome-clube"
            maxLength={60}
            className="pl-8"
            aria-invalid={erros.name !== undefined}
            {...formulario.register("name")}
          />
        </div>
      </CampoFormulario>

      <CampoFormulario
        id="sigla-clube"
        rotulo="Sigla"
        erro={erros.acronym?.message}
        ajuda="3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
      >
        <Input
          id="sigla-clube"
          maxLength={3}
          aria-invalid={erros.acronym !== undefined}
          {...formulario.register("acronym")}
        />
      </CampoFormulario>

      <p className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Wallet className="size-3.5" />O clube começa com 300,00 em caixa e sem jogadores.
      </p>
    </ModalFormulario>
  );
}
