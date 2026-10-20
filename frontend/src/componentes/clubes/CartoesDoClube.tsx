import { Coins, Landmark, Shirt, Wallet, type LucideIcon } from "lucide-react";

import { limiteDoElenco, type ClubeDetalhado } from "@/api/clube";
import { formatarMoeda } from "@/lib/formatacao";

interface Cartao {
  titulo: string;
  icone: LucideIcon;
  valor: string;
  emMoedas: boolean;
  nota: string;
}

interface PropriedadesCartoesDoClube {
  clube: ClubeDetalhado;
}

// C05: os 4 números do clube, como a API devolve (F07); a tela não soma nada (REQ-043)
export function CartoesDoClube({ clube }: PropriedadesCartoesDoClube) {
  const cartoes: Cartao[] = [
    {
      titulo: "Caixa",
      icone: Wallet,
      valor: formatarMoeda(clube.cash),
      emMoedas: true,
      nota: "Só muda por compras e vendas",
    },
    {
      titulo: "Valor do elenco",
      icone: Coins,
      valor: formatarMoeda(clube.squad_value),
      emMoedas: true,
      nota: "Soma dos valores de mercado",
    },
    {
      titulo: "Patrimônio",
      icone: Landmark,
      valor: formatarMoeda(clube.net_worth),
      emMoedas: true,
      nota: "Caixa + valor do elenco",
    },
    {
      titulo: "Elenco",
      icone: Shirt,
      valor: `${clube.players.length} de ${limiteDoElenco}`,
      emMoedas: false,
      nota: `Limite de ${limiteDoElenco} jogadores`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cartoes.map(({ titulo, icone: Icone, valor, emMoedas, nota }) => (
        <div key={titulo} className="rounded-xl border p-4">
          <p className="flex items-center justify-between text-sm text-muted-foreground">
            {titulo}
            <Icone className="size-4" />
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {valor}
            {emMoedas && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">moedas</span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{nota}</p>
        </div>
      ))}
    </div>
  );
}
