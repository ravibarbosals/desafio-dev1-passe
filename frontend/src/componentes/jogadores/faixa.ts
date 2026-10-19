export interface RegrasDaFaixa {
  // Como o campo aparece na mensagem: "Idade mínima", "Valor máximo"
  rotulos: { minimo: string; maximo: string };
  piso: number;
  teto: number;
  // 0 para idade; 2 para valor (a API recusa a 3ª casa)
  casas: 0 | 2;
}

export type ResultadoDaFaixa =
  | { valida: true; minimo?: number; maximo?: number }
  | { valida: false; erro: string };

// Mesma regra da API (min_age/max_age 16–45; min_value/max_value 0–550 com até 2 casas; mínimo ≤ máximo),
// conferida antes de filtrar para a mensagem aparecer junto ao campo, e não como 400 (REQ-044)
export function lerFaixa(
  minimoDigitado: string,
  maximoDigitado: string,
  regras: RegrasDaFaixa,
): ResultadoDaFaixa {
  const formato = regras.casas === 0 ? /^\d+$/ : /^\d+([.,]\d{1,2})?$/;
  const descricao =
    regras.casas === 0
      ? `um número inteiro de ${regras.piso} a ${regras.teto}`
      : `um valor de ${regras.piso} a ${regras.teto}, com até 2 casas decimais`;

  function ler(texto: string, rotulo: string): number | undefined | string {
    const limpo = texto.trim();
    if (limpo === "") {
      return undefined;
    }
    const numero = Number(limpo.replace(",", "."));
    if (!formato.test(limpo) || numero < regras.piso || numero > regras.teto) {
      return `${rotulo} deve ser ${descricao}.`;
    }
    return numero;
  }

  const minimo = ler(minimoDigitado, regras.rotulos.minimo);
  if (typeof minimo === "string") {
    return { valida: false, erro: minimo };
  }
  const maximo = ler(maximoDigitado, regras.rotulos.maximo);
  if (typeof maximo === "string") {
    return { valida: false, erro: maximo };
  }
  if (minimo !== undefined && maximo !== undefined && minimo > maximo) {
    return {
      valida: false,
      erro: `${regras.rotulos.minimo} não pode ser maior que ${regras.rotulos.maximo.toLowerCase()}.`,
    };
  }
  return { valida: true, minimo, maximo };
}
