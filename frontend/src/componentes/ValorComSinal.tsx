import { formatarMoedaComSinal } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

interface PropriedadesValorComSinal {
  valor: number;
  className?: string;
}

// Entrada em verde com "+", saída em vermelho com "-" (lucro, variação do caixa: F08, F09)
export function ValorComSinal({ valor, className }: PropriedadesValorComSinal) {
  return (
    <span className={cn(valor > 0 && "text-green-700", valor < 0 && "text-destructive", className)}>
      {formatarMoedaComSinal(valor)}
    </span>
  );
}
