import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ItemDaLista {
  rotulo: string;
  // Explicação curta abaixo do rótulo (ex.: "Valor de venda − multa − comissão")
  nota?: string;
  valor: ReactNode;
  destaque?: boolean;
}

interface PropriedadesListaDeValores {
  itens: ItemDaLista[];
}

// Rótulo à esquerda e valor à direita: resultado do cadastro (J07), contrato e resultado da venda (V01, V02)
export function ListaDeValores({ itens }: PropriedadesListaDeValores) {
  return (
    <dl className="divide-y rounded-lg border text-sm">
      {itens.map(({ rotulo, nota, valor, destaque }) => (
        <div
          key={rotulo}
          className={cn(
            "flex items-center justify-between gap-4 p-3",
            destaque && "bg-muted/50 font-semibold",
          )}
        >
          <dt>
            {rotulo}
            {nota && (
              <span className="block text-xs font-normal text-muted-foreground">{nota}</span>
            )}
          </dt>
          <dd className="text-right">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
