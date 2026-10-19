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
  textoConfirmar: string;
  // Enquanto envia, os botões ficam desabilitados: um clique, um pedido (REQ-042)
  enviando: boolean;
  aoConfirmar: () => void;
  // Ação que não se desfaz (excluir, vender): botão vermelho
  destrutivo?: boolean;
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
}: PropriedadesModalConfirmacao) {
  return (
    <AlertDialog open={aberto} onOpenChange={(valor) => !enviando && aoMudarAberto(valor)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={enviando}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant={destrutivo ? "destructive" : "default"}
            disabled={enviando}
            onClick={aoConfirmar}
          >
            {enviando ? "Enviando…" : textoConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
