import {
  HandCoins,
  Percent,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import type { ResumoDoHistorico } from "@/api/mercado";
import { ValorComSinal } from "@/componentes/ValorComSinal";
import { formatarMoeda } from "@/lib/formatacao";

interface Total {
  titulo: string;
  icone: LucideIcon;
  valor: ReactNode;
  nota: string;
}

interface PropriedadesTotaisDoHistorico {
  resumo: ResumoDoHistorico;
}

// F10: os totais do summary, já somados pela API com os filtros da tela (REQ-043)
export function TotaisDoHistorico({ resumo }: PropriedadesTotaisDoHistorico) {
  const totais: Total[] = [
    {
      titulo: "Total pago em compras",
      icone: ShoppingCart,
      valor: formatarMoeda(resumo.total_spent),
      nota: "Valor + taxa",
    },
    {
      titulo: "Total recebido em vendas",
      icone: HandCoins,
      valor: formatarMoeda(resumo.total_received),
      nota: "Crédito líquido",
    },
    {
      titulo: "Taxas e comissões",
      icone: Percent,
      valor: formatarMoeda(resumo.total_fees),
      nota: "Somadas",
    },
    {
      titulo: "Multas",
      icone: TriangleAlert,
      valor: formatarMoeda(resumo.total_penalties),
      nota: "Por fidelidade",
    },
    {
      titulo: "Lucro total",
      icone: resumo.total_profit < 0 ? TrendingDown : TrendingUp,
      valor: <ValorComSinal valor={resumo.total_profit} />,
      nota: "Soma dos lucros, com sinal",
    },
  ];

  return (
    <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-5">
      {totais.map(({ titulo, icone: Icone, valor, nota }) => (
        <div key={titulo} className="bg-muted/40 p-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icone className="size-3.5" />
            {titulo}
          </dt>
          <dd className="mt-1 font-semibold">{valor}</dd>
          <dd className="text-xs text-muted-foreground">{nota}</dd>
        </div>
      ))}
    </dl>
  );
}
