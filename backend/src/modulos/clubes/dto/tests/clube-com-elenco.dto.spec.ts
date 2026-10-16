import { criarClubeComElencoResposta } from '@/modulos/clubes/dto/clube-com-elenco-resposta.dto';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';

describe('criarClubeComElencoResposta', () => {
  it('monta o exemplo 2.2.2 do enunciado', () => {
    const clube = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', sigla: 'AGU', caixa: 26115 });
    const jogador = Object.assign(new Jogador(), {
      id: 2,
      nome: 'Meia Lua',
      posicao: 'MEI',
      agilidade: 85,
      idade: 25,
      condicao: 'MAL_CONDICIONADO',
      valorBase: 4000,
      velocidade: 70,
      finalizacao: 68,
      passe: 82,
      drible: 79,
      defesa: 55,
      fisico: 64,
      potencial: 86,
      clubeId: 1,
    });
    const contrato = Object.assign(new Contrato(), { valorCompra: 3700, fidelidadeAte: new Date('2027-03-02T13:15:00Z') });
    const resposta = criarClubeComElencoResposta({ clube, valorDoElenco: 3700, elenco: [{ jogador, contrato, diasRestantes: 120, percentualDeMulta: 10 }] });
    expect(resposta).toEqual({
      id: 1,
      name: 'Águias FC',
      acronym: 'AGU',
      cash: 261.15,
      squad_value: 37,
      net_worth: 298.15,
      players: [
        {
          id: 2,
          name: 'Meia Lua',
          position: 'MEI',
          agility: 85,
          age: 25,
          condition: 'MAL_CONDICIONADO',
          base_value: 40,
          market_value: 37,
          pace: 70,
          shooting: 68,
          passing: 82,
          dribbling: 79,
          defending: 55,
          physical: 64,
          potential: 86,
          overall: 75,
          club_id: 1,
          contract: { purchase_value: 37, loyalty_until: '2027-03-02T10:15:00-03:00', remaining_days: 120, penalty_rate: 10 },
        },
      ],
    });
  });
});
