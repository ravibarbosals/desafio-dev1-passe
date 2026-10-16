import { criarListaDeJogadoresResposta } from '@/modulos/jogadores/dto/lista-de-jogadores-resposta.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';

const jogador = Object.assign(new Jogador(), {
  id: 2,
  nome: 'Meia Lua',
  posicao: 'MEI',
  agilidade: 85,
  idade: 25,
  valorBase: 4000,
  condicao: 'MAL_CONDICIONADO',
  clubeId: null,
  velocidade: 70,
  finalizacao: 68,
  passe: 82,
  drible: 79,
  defesa: 55,
  fisico: 64,
  potencial: 86,
});

describe('criarListaDeJogadoresResposta', () => {
  it('monta data e meta no formato do exemplo 5.3', () => {
    const resposta = criarListaDeJogadoresResposta({ itens: [jogador], pagina: 1, limite: 10, totalDeItens: 1, totalDePaginas: 1 });
    expect(resposta.meta).toEqual({ page: 1, limit: 10, total_items: 1, total_pages: 1 });
    expect(resposta.data).toHaveLength(1);
    expect(resposta.data[0]).toMatchObject({ id: 2, condition: 'MAL_CONDICIONADO', base_value: 40, market_value: 37, overall: 75 });
  });

  it('página vazia sai com data vazio e o meta correto (RN07.6)', () => {
    expect(criarListaDeJogadoresResposta({ itens: [], pagina: 4, limite: 10, totalDeItens: 23, totalDePaginas: 3 })).toEqual({
      data: [],
      meta: { page: 4, limit: 10, total_items: 23, total_pages: 3 },
    });
  });
});