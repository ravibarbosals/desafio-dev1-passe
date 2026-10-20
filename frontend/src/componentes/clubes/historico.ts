import type { FiltroDoHistorico, TipoDeTransacao, Transacao } from "@/api/mercado";

export const todosOsTipos: TipoDeTransacao[] = ["COMPRA", "VENDA"];

// Valor do Select de jogador sem filtro
export const todosOsJogadores = "todos";

export interface JogadorDoHistorico {
  id: number;
  nome: string;
}

// AM-007: sempre fica pelo menos um tipo marcado; desmarcar o último não muda nada
export function alternarTipo(tipos: TipoDeTransacao[], tipo: TipoDeTransacao): TipoDeTransacao[] {
  if (!tipos.includes(tipo)) {
    return todosOsTipos.filter((item) => item === tipo || tipos.includes(item));
  }
  return tipos.length > 1 ? tipos.filter((item) => item !== tipo) : tipos;
}

// Os dois tipos marcados = sem type; nunca manda type vazio, que a API recusa com 400 (AM-007)
export function montarFiltroDoHistorico(
  tipos: TipoDeTransacao[],
  jogador: string,
): FiltroDoHistorico {
  return {
    ...(tipos.length === 1 && { type: tipos[0] }),
    ...(jogador !== todosOsJogadores && { player_id: Number(jogador) }),
  };
}

// FLX-007: um item por jogador do histórico sem filtros, com o nome da transação mais recente
// (a lista vem da mais recente para a mais antiga, e o nome gravado pode mudar entre elas)
export function listarJogadoresDoHistorico(transacoes: Transacao[]): JogadorDoHistorico[] {
  const jogadores = new Map<number, string>();
  for (const transacao of transacoes) {
    if (!jogadores.has(transacao.player_id)) {
      jogadores.set(transacao.player_id, transacao.player_name);
    }
  }
  return [...jogadores]
    .map(([id, nome]) => ({ id, nome }))
    .toSorted((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
