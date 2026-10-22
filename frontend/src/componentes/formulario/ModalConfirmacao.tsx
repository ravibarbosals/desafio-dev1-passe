import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/componentes/ui/alert-dialog";
import { Button } from "@/componentes/ui/button";

interface PropriedadesModalConfirmacao {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  titulo: string;
  descricao: ReactNode;
  // Texto ou ícone + texto (ex.: a lixeira do "Excluir jogador", J13)
  textoConfirmar: ReactNode;
  textoEnviando?: string;
  // Enquanto envia, os botões ficam desabilitados: um clique, um pedido (REQ-042)
  enviando: boolean;
  aoConfirmar: () => void;
  // Ação que não se desfaz (ex.: excluir): botão vermelho
  destrutivo?: boolean;
  // Detalhes entre a descrição e os botões (ex.: o contrato na venda, V01)
  children?: ReactNode;
}

// O botão de confirmar não fecha o modal sozinho: quem chama fecha no sucesso e deixa aberto no erro
export function ModalConfirmacao({
  aberto,
  aoMudarAberto,
  titulo,
  descricao,
  textoConfirmar,
  enviando,
  aoConfirmar,
  destrutivo = false,
  textoEnviando = "Enviando…",
  children,
}: PropriedadesModalConfirmacao) {
  return (
    <AlertDialog open={aberto} onOpenChange={(valor) => !enviando && aoMudarAberto(valor)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={enviando}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant={destrutivo ? "destructive" : "default"}
            disabled={enviando}
            onClick={aoConfirmar}
          >
            {enviando ? textoEnviando : textoConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
