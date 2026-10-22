import type { ReactNode } from "react";

import type { Jogador } from "@/api/jogadores";
import { formatarMoeda } from "@/lib/formatacao";
import { nomesDasPosicoes } from "@/lib/rotulos";

import { AvatarDoJogador } from "./AvatarDoJogador";

interface PropriedadesCartaoDoJogador {
  jogador: Pick<Jogador, "id" | "name" | "position" | "age">;
  // À direita: a condição (J10) ou o valor de mercado (V01)
  lateral: ReactNode;
}

interface PropriedadesValorDeMercado {
  valor: number;
}

// Quem é o jogador, no alto dos modais de condição e de venda
export function CartaoDoJogador({ jogador, lateral }: PropriedadesCartaoDoJogador) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center gap-3">
        <AvatarDoJogador id={jogador.id} nome={jogador.name} />
        <div>
          <p className="font-medium">{jogador.name}</p>
          <p className="text-xs text-muted-foreground">
            {jogador.position} · {nomesDasPosicoes[jogador.position]} · {jogador.age} anos
          </p>
        </div>
      </div>
      {lateral}
    </div>
  );
}

// Lateral do cartão na compra (M01) e na venda (V01)
export function ValorDeMercado({ valor }: PropriedadesValorDeMercado) {
  return (
    <div className="text-right">
      <p className="text-xs text-muted-foreground">Valor de mercado</p>
      <p className="font-semibold">{formatarMoeda(valor)}</p>
    </div>
  );
}
