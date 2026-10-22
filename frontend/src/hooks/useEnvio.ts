import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { extrairMensagemErro } from "@/lib/erro-api";

// Só o texto, ou título e descrição (J11: "Condição alterada" e o valor novo embaixo)
type MensagemSucesso = string | { titulo: string; descricao: string };

interface OpcoesEnvio<TDados, TResposta> {
  enviar: (dados: TDados) => Promise<TResposta>;
  // Aviso de sucesso; sem ele, a tela mostra o resultado do seu jeito (ex.: o modal da compra)
  mensagemSucesso?: MensagemSucesso | ((resposta: TResposta) => MensagemSucesso);
  // Listas que mudam com o envio e precisam ser buscadas de novo
  invalidar?: QueryKey[];
  aoConcluir?: (resposta: TResposta) => void;
  avisarErro?: boolean;
}

// REQ-042: sucesso com aviso, erro com o message da API; isPending desabilita o botão
export function useEnvio<TDados, TResposta>({
  enviar,
  mensagemSucesso,
  invalidar = [],
  aoConcluir,
  avisarErro = true,
}: OpcoesEnvio<TDados, TResposta>) {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: enviar,
    onSuccess: async (resposta) => {
      await Promise.all(
        invalidar.map((chave) => clienteQuery.invalidateQueries({ queryKey: chave })),
      );
      if (mensagemSucesso) {
        const mensagem =
          typeof mensagemSucesso === "function" ? mensagemSucesso(resposta) : mensagemSucesso;
        if (typeof mensagem === "string") {
          toast.success(mensagem);
        } else {
          toast.success(mensagem.titulo, { description: mensagem.descricao });
        }
      }
      aoConcluir?.(resposta);
    },
    onError: (erro) => {
      if (avisarErro) {
        toast.error(extrairMensagemErro(erro));
      }
    },
  });
}
