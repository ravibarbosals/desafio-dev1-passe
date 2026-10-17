import { criarLinhaDaClassificacaoResposta } from '@/modulos/liga/dto/classificacao-resposta.dto';

describe('criarLinhaDaClassificacaoResposta', () => {
  it('monta a linha do Águias FC no exemplo 2.4.3', () => {
    const linha = { posicao: 3, clubeId: 1, nomeClube: 'Águias FC', jogos: 1, vitorias: 0, empates: 0, derrotas: 1, golsPro: 1, golsContra: 2, saldo: -1, pontos: 0 };
    expect(criarLinhaDaClassificacaoResposta(linha)).toEqual({
      position: 3,
      club_id: 1,
      club_name: 'Águias FC',
      played: 1,
      wins: 0,
      draws: 0,
      losses: 1,
      goals_for: 1,
      goals_against: 2,
      goal_difference: -1,
      points: 0,
    });
  });

  it('cada contagem vai para o próprio campo', () => {
    const linha = { posicao: 1, clubeId: 2, nomeClube: 'Delta FC', jogos: 9, vitorias: 5, empates: 3, derrotas: 1, golsPro: 14, golsContra: 6, saldo: 8, pontos: 18 };
    expect(criarLinhaDaClassificacaoResposta(linha)).toMatchObject({ played: 9, wins: 5, draws: 3, losses: 1, goals_for: 14, goals_against: 6, goal_difference: 8, points: 18 });
  });
});
