import type { FormEvent, ReactNode } from "react";

import { Button } from "@/componentes/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { cn } from "@/lib/utils";

interface PropriedadesModalFormulario {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao: ReactNode;
  // Com o react-hook-form: formulario.handleSubmit(...)
  aoEnviar: () => void;
  enviando: boolean;
  textoEnviar: string;
  textoEnviando?: string;
  // Ex.: a condição escolhida é a atual (J10)
  podeEnviar?: boolean;
  // Texto à esquerda dos botões (ex.: "O jogador começa livre e Apto.")
  observacao?: ReactNode;
  className?: string;
  children: ReactNode;
}

// DEC-058: a casca dos modais de formulário; os campos de cada um entram como children.
// REQ-042: durante o envio, os botões ficam desabilitados e o modal não fecha.
export function ModalFormulario({
  aberto,
  aoFechar,
  titulo,
  descricao,
  aoEnviar,
  enviando,
  textoEnviar,
  textoEnviando = "Salvando…",
  podeEnviar = true,
  observacao,
  className,
  children,
}: PropriedadesModalFormulario) {
  function enviar(evento: FormEvent) {
    evento.preventDefault();
    aoEnviar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && !enviando && aoFechar()}>
      <DialogContent className={className}>
        <form noValidate className="flex flex-col gap-4" onSubmit={enviar}>
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogDescription>{descricao}</DialogDescription>
          </DialogHeader>

          {children}

          <DialogFooter
            className={cn("border-t pt-4", observacao && "items-center sm:justify-between")}
          >
            {observacao && <p className="text-xs text-muted-foreground">{observacao}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={enviando} onClick={aoFechar}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!podeEnviar || enviando}>
                {enviando ? textoEnviando : textoEnviar}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
