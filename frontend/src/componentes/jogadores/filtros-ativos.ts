import type { FiltrosDosJogadores } from "@/api/jogadores";
import { formatarMoeda } from "@/lib/formatacao";
import { nomesDasCondicoes, nomesDasPosicoes } from "@/lib/rotulos";

export interface FiltroAtivo {
  rotulo: string;
  // Campos que o "x" do filtro limpa
  limpar: Partial<FiltrosDosJogadores>;
}

// "Idade: 18 a 30", "a partir de 18", "até 30"
function descreverFaixa(minimo: string | undefined, maximo: string | undefined): string {
  if (minimo !== undefined && maximo !== undefined) {
    return `${minimo} a ${maximo}`;
  }
  return minimo !== undefined ? `a partir de ${minimo}` : `até ${maximo}`;
}

// Etiquetas da linha "Filtros ativos" (J02); a aba, a ordem e a página ficam de fora
export function listarFiltrosAtivos(
  filtros: FiltrosDosJogadores,
  nomeDoClube: (clubeId: number) => string | undefined,
): FiltroAtivo[] {
  const ativos: FiltroAtivo[] = [];
  const busca = filtros.busca?.trim() ?? "";
  // Com menos de 2 caracteres a busca não vai para a API (montarParametrosDaListagem)
  if (busca.length >= 2) {
    ativos.push({ rotulo: `Busca: ${busca}`, limpar: { busca: undefined } });
  }
  if (filtros.posicao) {
    ativos.push({
      rotulo: `Posição: ${nomesDasPosicoes[filtros.posicao]}`,
      limpar: { posicao: undefined },
    });
  }
  if (filtros.condicao) {
    ativos.push({
      rotulo: `Condição: ${nomesDasCondicoes[filtros.condicao]}`,
      limpar: { condicao: undefined },
    });
  }
  if (filtros.clubeId !== undefined) {
    ativos.push({
      rotulo: `Clube: ${nomeDoClube(filtros.clubeId) ?? `#${filtros.clubeId}`}`,
      limpar: { clubeId: undefined },
    });
  }
  if (filtros.idadeMinima !== undefined || filtros.idadeMaxima !== undefined) {
    ativos.push({
      rotulo: `Idade: ${descreverFaixa(filtros.idadeMinima?.toString(), filtros.idadeMaxima?.toString())}`,
      limpar: { idadeMinima: undefined, idadeMaxima: undefined },
    });
  }
  if (filtros.valorMinimo !== undefined || filtros.valorMaximo !== undefined) {
    const minimo =
      filtros.valorMinimo === undefined ? undefined : formatarMoeda(filtros.valorMinimo);
    const maximo =
      filtros.valorMaximo === undefined ? undefined : formatarMoeda(filtros.valorMaximo);
    ativos.push({
      rotulo: `Valor de mercado: ${descreverFaixa(minimo, maximo)}`,
      limpar: { valorMinimo: undefined, valorMaximo: undefined },
    });
  }
  return ativos;
}
