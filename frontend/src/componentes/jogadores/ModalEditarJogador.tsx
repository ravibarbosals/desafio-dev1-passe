import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { editarJogador, type EdicaoDoJogador, type Jogador } from "@/api/jogadores";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { ModalFormulario } from "@/componentes/formulario/ModalFormulario";
import { Input } from "@/componentes/ui/input";
import { useEnvio } from "@/hooks/useEnvio";
import { formatarMoeda } from "@/lib/formatacao";

import { criarEsquemaDaEdicao } from "./esquema-do-jogador";
import { SeletorDePosicao } from "./SeletorDePosicao";

interface PropriedadesModalEditarJogador {
  jogador: Jogador;
  aoFechar: () => void;
}

// J09: só nome, posição, idade e agilidade mudam (PUT /players/{id}); a página monta um modal por
// jogador (key), então o formulário sempre começa com os dados dele
export function ModalEditarJogador({ jogador, aoFechar }: PropriedadesModalEditarJogador) {
  const formulario = useForm({
    resolver: zodResolver(criarEsquemaDaEdicao(jogador.age)),
    defaultValues: {
      name: jogador.name,
      position: jogador.position,
      age: String(jogador.age),
      agility: String(jogador.agility),
    },
  });
  const edicao = useEnvio({
    enviar: (dados: EdicaoDoJogador) => editarJogador(jogador.id, dados),
    mensagemSucesso: (editado) => `Alterações de ${editado.name} salvas.`,
    // O valor de mercado pode mudar, e com ele o valor do elenco e o patrimônio do clube
    invalidar: [["jogadores"], ["clubes"]],
    aoConcluir: aoFechar,
  });
  const erros = formulario.formState.errors;
  const comClube = jogador.club_id !== null;

  return (
    <ModalFormulario
      aberto
      aoFechar={aoFechar}
      titulo="Editar jogador"
      descricao="Edite nome, posição, idade e agilidade. Os demais dados não mudam."
      aoEnviar={formulario.handleSubmit((dados) => edicao.mutate(dados))}
      enviando={edicao.isPending}
      textoEnviar="Salvar alterações"
    >
      <CampoFormulario
        id="nome-edicao"
        rotulo="Nome"
        erro={erros.name?.message}
        ajuda="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
      >
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="nome-edicao"
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
            travada={comClube}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <CampoFormulario
          id="idade-edicao"
          rotulo="Idade"
          erro={erros.age?.message}
          ajuda={`De 16 a 45, sem diminuir (atual: ${jogador.age}).`}
        >
          <Input
            id="idade-edicao"
            inputMode="numeric"
            aria-invalid={erros.age !== undefined}
            {...formulario.register("age")}
          />
        </CampoFormulario>
        <CampoFormulario
          id="agilidade-edicao"
          rotulo="Agilidade"
          erro={erros.agility?.message}
          ajuda="De 1 a 100 (até 85 com 35 anos ou mais)."
        >
          <Input
            id="agilidade-edicao"
            inputMode="numeric"
            aria-invalid={erros.agility !== undefined}
            {...formulario.register("agility")}
          />
        </CampoFormulario>
      </div>

      <p className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        Não mudam depois do cadastro: valor base ({formatarMoeda(jogador.base_value)}), indicadores
        e potencial.
      </p>
    </ModalFormulario>
  );
}
