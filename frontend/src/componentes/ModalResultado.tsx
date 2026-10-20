import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

import { ListaDeValores, type ItemDaLista } from "@/componentes/ListaDeValores";
import { Button } from "@/componentes/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";

interface PropriedadesModalResultado {
  titulo: string;
  descricao: ReactNode;
  // Os valores que a API devolveu, como ela devolveu (REQ-043)
  itens: ItemDaLista[];
  aoFechar: () => void;
  // Botão ao lado do Fechar (ex.: "Ver clube" na compra, "Ver histórico" na venda)
  acao?: ReactNode;
}

// Resultado de uma ação que a API calculou: cadastro (J07), compra (M05) e venda (V02, V03)
export function ModalResultado({
  titulo,
  descricao,
  itens,
  aoFechar,
  acao,
}: PropriedadesModalResultado) {
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <CircleCheck className="size-6 text-green-600" />
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <ListaDeValores itens={itens} />
        <DialogFooter>
          {acao}
          <Button type="button" onClick={aoFechar}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
