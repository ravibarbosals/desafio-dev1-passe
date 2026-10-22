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

export interface PaginaInterna {
  tipo: "clube" | "partida";
  id: string;
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

// /clubes/3 e /partidas/7 ganham um terceiro nível na trilha (C04, L03)
export function encontrarPaginaInterna(caminhoAtual: string): PaginaInterna | undefined {
  const clube = /^\/clubes\/([^/]+)$/.exec(caminhoAtual);
  if (clube) {
    return { tipo: "clube", id: clube[1] };
  }
  const partida = /^\/partidas\/([^/]+)$/.exec(caminhoAtual);
  return partida ? { tipo: "partida", id: partida[1] } : undefined;
}
