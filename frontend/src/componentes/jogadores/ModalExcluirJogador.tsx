import { excluirJogador, type Jogador } from "@/api/jogadores";
import { ModalConfirmacao } from "@/componentes/formulario/ModalConfirmacao";
import { useEnvio } from "@/hooks/useEnvio";
import { nomesDasPosicoes } from "@/lib/rotulos";

interface PropriedadesModalExcluirJogador {
  // undefined: modal fechado
  jogador: Jogador | undefined;
  aoFechar: () => void;
}

// FLX-003 (J13, J14): confirmação, DELETE e aviso; a lista recarrega da API
export function ModalExcluirJogador({ jogador, aoFechar }: PropriedadesModalExcluirJogador) {
  const exclusao = useEnvio({
    enviar: (id: number) => excluirJogador(id),
    mensagemSucesso: `${jogador?.name ?? "Jogador"} foi excluído.`,
    invalidar: [["jogadores"]],
    aoConcluir: aoFechar,
  });

  return (
    <ModalConfirmacao
      aberto={jogador !== undefined}
      aoMudarAberto={(aberto) => !aberto && aoFechar()}
      titulo={`Excluir ${jogador?.name ?? ""}?`}
      descricao={
        <>
          O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam
          como foram gravadas.
          {jogador && (
            <span className="mt-3 block rounded-lg border p-3 text-foreground">
              {jogador.name} · {jogador.position} · {nomesDasPosicoes[jogador.position]} ·{" "}
              {jogador.age} anos
            </span>
          )}
        </>
      }
      textoConfirmar="Excluir jogador"
      destrutivo
      enviando={exclusao.isPending}
      aoConfirmar={() => jogador && exclusao.mutate(jogador.id)}
    />
  );
}
