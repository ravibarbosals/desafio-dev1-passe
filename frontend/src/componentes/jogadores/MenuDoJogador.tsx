import { Ellipsis, Pencil, Trash2 } from "lucide-react";

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
  aoExcluir: (jogador: Jogador) => void;
}

interface PropriedadesMenuDoJogador extends AcoesDoJogador {
  jogador: Jogador;
}

// Menu ⋯ de cada linha (J08); Alterar condição entra no próximo passo, Comprar na TASK-050
export function MenuDoJogador({ jogador, aoEditar, aoExcluir }: PropriedadesMenuDoJogador) {
  // FLX-003: Excluir só aparece para jogador livre; com clube, a API responde 409
  const podeExcluir = jogador.club_id === null;

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
        {podeExcluir && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => aoExcluir(jogador)}>
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
