import { criarJogadorResposta } from '@/modulos/jogadores/dto/jogador-resposta.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';

// Jogador do exemplo 2.1.3 do enunciado, como volta do banco (valor base em centavos)
function criarJogador(campos: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), {
    id: 2,
    nome: 'Meia Lua',
    posicao: 'MEI',
    agilidade: 85,
    idade: 25,
    valorBase: 4000,
    condicao: 'APTO',
    clubeId: null,
    velocidade: 70,
    finalizacao: 68,
    passe: 82,
    drible: 79,
    defesa: 55,
    fisico: 64,
    potencial: 86,
    excluidoEm: null,
    ...campos,
  });
}

describe('criarJogadorResposta', () => {
  it('monta a resposta do exemplo do enunciado, com overall e valor de mercado calculados', () => {
    expect(criarJogadorResposta(criarJogador())).toEqual({
      id: 2,
      name: 'Meia Lua',
      position: 'MEI',
      agility: 85,
      age: 25,
      condition: 'APTO',
      base_value: 40,
      market_value: 40,
      pace: 70,
      shooting: 68,
      passing: 82,
      dribbling: 79,
      defending: 55,
      physical: 64,
      potential: 86,
      overall: 75,
      club_id: null,
    });
  });

  it('não expõe as colunas internas (excluido_em, datas)', () => {
    expect(Object.keys(criarJogadorResposta(criarJogador()))).toHaveLength(17);
  });

  it('muda o valor de mercado com a condição, sem mudar o valor base', () => {
    const resposta = criarJogadorResposta(criarJogador({ condicao: 'MAL_CONDICIONADO' }));
    expect(resposta).toMatchObject({ base_value: 40, market_value: 37 });
  });

  it('calcula o overall pela posição atual', () => {
    expect(criarJogadorResposta(criarJogador({ posicao: 'ATA' })).overall).toBe(72);
  });

  it('devolve o valor em moedas com 2 casas (41.44)', () => {
    expect(criarJogadorResposta(criarJogador({ valorBase: 4144, idade: 25 }))).toMatchObject({ base_value: 41.44, market_value: 41.44 });
  });
});