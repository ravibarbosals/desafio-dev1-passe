import { ListOrdered, Shield, Swords, Users, type LucideIcon } from "lucide-react";

export interface ItemDoMenu {
  caminho: "/jogadores" | "/clubes" | "/partidas" | "/classificacao";
  rotulo: string;
  icone: LucideIcon;
}

export interface SecaoDoMenu {
  titulo: string;
  itens: ItemDoMenu[];
}

// Menu lateral do mockup (requisitos.md §5.1, Layout); a trilha do cabeçalho sai da mesma lista
export const secoesDoMenu: SecaoDoMenu[] = [
  {
    titulo: "Mercado",
    itens: [
      { caminho: "/jogadores", rotulo: "Jogadores", icone: Users },
      { caminho: "/clubes", rotulo: "Clubes", icone: Shield },
    ],
  },
  {
    titulo: "Liga",
    itens: [
      { caminho: "/partidas", rotulo: "Partidas", icone: Swords },
      { caminho: "/classificacao", rotulo: "Classificação", icone: ListOrdered },
    ],
  },
];

// Seção e item da página aberta; as páginas de dentro (/clubes/3) ficam no item de cima
export function encontrarItemAtivo(
  caminhoAtual: string,
): { secao: string; item: ItemDoMenu } | undefined {
  for (const secao of secoesDoMenu) {
    const item = secao.itens.find(
      ({ caminho }) => caminhoAtual === caminho || caminhoAtual.startsWith(`${caminho}/`),
    );
    if (item) {
      return { secao: secao.titulo, item };
    }
  }
  return undefined;
}
