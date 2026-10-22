import type { Posicao } from "@/api/jogadores";
import { Button } from "@/componentes/ui/button";
import { nomesDasPosicoes } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

interface PropriedadesSeletorDePosicao {
  valor: Posicao | "";
  aoMudar: (posicao: Posicao) => void;
  erro?: string;
  // Jogador com clube não muda de posição (RN08): só a atual fica habilitada (J09)
  travada?: boolean;
}

// Os 5 botões de posição do J05 e do J09
export function SeletorDePosicao({
  valor,
  aoMudar,
  erro,
  travada = false,
}: PropriedadesSeletorDePosicao) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">Posição</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(Object.entries(nomesDasPosicoes) as [Posicao, string][]).map(([sigla, nome]) => (
          <Button
            key={sigla}
            type="button"
            variant="outline"
            aria-pressed={valor === sigla}
            disabled={travada && valor !== sigla}
            onClick={() => aoMudar(sigla)}
            className={cn(
              "h-auto flex-col gap-0 py-2",
              valor === sigla && "border-primary bg-primary/5 text-primary hover:bg-primary/10",
            )}
          >
            <span className="font-semibold">{sigla}</span>
            <span className={cn("text-xs font-normal", valor !== sigla && "text-muted-foreground")}>
              {nome}
            </span>
          </Button>
        ))}
      </div>
      {travada && (
        <p className="text-xs text-muted-foreground">
          Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
        </p>
      )}
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </fieldset>
  );
}
