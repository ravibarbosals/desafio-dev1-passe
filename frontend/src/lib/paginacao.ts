// "Mostrando 1–10 de 23": posição do primeiro e do último item da página (RN07: 10 por página)
export function calcularIntervalo(
  pagina: number,
  limite: number,
  totalItens: number,
): { inicio: number; fim: number } {
  if (totalItens === 0) {
    return { inicio: 0, fim: 0 };
  }
  const inicio = Math.min((pagina - 1) * limite + 1, totalItens);
  return { inicio, fim: Math.min(pagina * limite, totalItens) };
}

// Botões numerados: todos até 7 páginas; acima disso, a primeira, a última e as vizinhas da atual
export function listarPaginasVisiveis(
  pagina: number,
  totalPaginas: number,
): (number | "reticencias")[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }
  const vizinhas = [pagina - 1, pagina, pagina + 1].filter(
    (numero) => numero > 1 && numero < totalPaginas,
  );
  const paginas: (number | "reticencias")[] = [1];
  if (vizinhas[0] > 2) {
    paginas.push("reticencias");
  }
  paginas.push(...vizinhas);
  if (vizinhas[vizinhas.length - 1] < totalPaginas - 1) {
    paginas.push("reticencias");
  }
  paginas.push(totalPaginas);
  return paginas;
}
