import { Trash2 } from "lucide-react";

import { excluirJogador, type Jogador } from "@/api/jogadores";
import { ModalConfirmacao } from "@/componentes/formulario/ModalConfirmacao";
import { Badge } from "@/componentes/ui/badge";
import { useEnvio } from "@/hooks/useEnvio";

import { CartaoDoJogador } from "./CartaoDoJogador";

interface PropriedadesModalExcluirJogador {
  // undefined: modal fechado
  jogador: Jogador | undefined;
  aoFechar: () => void;
}

// FLX-003 (J13, J14): confirmação, DELETE e aviso; a lista recarrega da API
export function ModalExcluirJogador({ jogador, aoFechar }: PropriedadesModalExcluirJogador) {
  const exclusao = useEnvio({
    enviar: (id: number) => excluirJogador(id),
    mensagemSucesso: {
      titulo: "Jogador excluído",
      descricao: `${jogador?.name ?? "O jogador"} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
    },
    invalidar: [["jogadores"]],
    aoConcluir: aoFechar,
  });

  return (
    <ModalConfirmacao
      aberto={jogador !== undefined}
      aoMudarAberto={(aberto) => !aberto && aoFechar()}
      titulo={`Excluir ${jogador?.name ?? ""}?`}
      descricao="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
      textoConfirmar={
        <>
          <Trash2 />
          Excluir jogador
        </>
      }
      destrutivo
      enviando={exclusao.isPending}
      aoConfirmar={() => jogador && exclusao.mutate(jogador.id)}
    >
      {/* Só jogador livre chega aqui (FLX-003) */}
      {jogador && (
        <CartaoDoJogador jogador={jogador} lateral={<Badge variant="secondary">Livre</Badge>} />
      )}
    </ModalConfirmacao>
  );
}
