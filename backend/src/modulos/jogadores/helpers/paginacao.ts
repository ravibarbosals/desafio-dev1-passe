export interface Pagina<T> {
  itens: T[];
  pagina: number;
  limite: number;
  totalDeItens: number;
  totalDePaginas: number;
}

// RN07.4 a RN07.6: pagina depois de filtrar e ordenar; o total conta todos; página além da última vem vazia
export function paginar<T>(itens: readonly T[], pagina: number, limite: number): Pagina<T> {
  const inicio = (pagina - 1) * limite;
  return {
    itens: itens.slice(inicio, inicio + limite),
    pagina,
    limite,
    totalDeItens: itens.length,
    totalDePaginas: Math.ceil(itens.length / limite),
  };
}
