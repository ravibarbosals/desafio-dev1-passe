import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { extrairMensagemErro } from "@/lib/erro-api";

interface OpcoesEnvio<TDados, TResposta> {
  enviar: (dados: TDados) => Promise<TResposta>;
  // Aviso de sucesso; sem ele, a tela mostra o resultado do seu jeito (ex.: o modal da compra)
  mensagemSucesso?: string | ((resposta: TResposta) => string);
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
        toast.success(
          typeof mensagemSucesso === "function" ? mensagemSucesso(resposta) : mensagemSucesso,
        );
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
