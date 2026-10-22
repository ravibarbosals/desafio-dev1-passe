import { Ellipsis, HeartPulse, Pencil, ShoppingCart, Trash2 } from "lucide-react";

import type { Jogador } from "@/api/jogadores";
import { Button } from "@/componentes/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/componentes/ui/dropdown-menu";

export interface AcoesDoJogador {
  aoEditar: (jogador: Jogador) => void;
  aoAlterarCondicao: (jogador: Jogador) => void;
  aoExcluir: (jogador: Jogador) => void;
  aoComprar: (jogador: Jogador) => void;
}

interface PropriedadesMenuDoJogador extends AcoesDoJogador {
  jogador: Jogador;
}

// Menu ⋯ de cada linha (J08); o Comprar também fica ao lado dele, como botão (M01)
export function MenuDoJogador({
  jogador,
  aoEditar,
  aoAlterarCondicao,
  aoExcluir,
  aoComprar,
}: PropriedadesMenuDoJogador) {
  // FLX-003 e RN12: Excluir e Comprar só aparecem para jogador livre; com clube, a API recusa
  const livre = jogador.club_id === null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Ações de ${jogador.name}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{jogador.name}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => aoEditar(jogador)}>
          <Pencil />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => aoAlterarCondicao(jogador)}>
          <HeartPulse />
          Alterar condição
        </DropdownMenuItem>
        {livre && (
          <>
            <DropdownMenuItem onSelect={() => aoComprar(jogador)}>
              <ShoppingCart />
              Comprar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="flex-col items-start gap-0.5"
              onSelect={() => aoExcluir(jogador)}
            >
              <span className="flex items-center gap-2">
                <Trash2 />
                Excluir
              </span>
              <span className="text-xs text-muted-foreground">
                Disponível porque o jogador está livre.
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
