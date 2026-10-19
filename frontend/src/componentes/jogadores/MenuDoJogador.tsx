import { Ellipsis, Trash2 } from "lucide-react";

import type { Jogador } from "@/api/jogadores";
import { Button } from "@/componentes/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/componentes/ui/dropdown-menu";

export interface AcoesDoJogador {
  aoExcluir: (jogador: Jogador) => void;
}

interface PropriedadesMenuDoJogador extends AcoesDoJogador {
  jogador: Jogador;
}

// Menu ⋯ de cada linha (J08); Editar e Alterar condição entram nos próximos passos, Comprar na TASK-050
export function MenuDoJogador({ jogador, aoExcluir }: PropriedadesMenuDoJogador) {
  // FLX-003: Excluir só aparece para jogador livre; com clube, a API responde 409
  const podeExcluir = jogador.club_id === null;
  if (!podeExcluir) {
    return null;
  }

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
        <DropdownMenuItem variant="destructive" onSelect={() => aoExcluir(jogador)}>
          <Trash2 />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
