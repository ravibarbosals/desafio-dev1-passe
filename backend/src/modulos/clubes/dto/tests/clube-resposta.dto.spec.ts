import { criarClubeResposta } from '@/modulos/clubes/dto/clube-resposta.dto';
import { Clube } from '@/modulos/clubes/entities/clube.entity';

describe('criarClubeResposta', () => {
  it('converte os centavos e soma o patrimônio (net_worth = cash + squad_value)', () => {
    const clube = Object.assign(new Clube(), { id: 1, nome: 'Águias FC', sigla: 'AGU', caixa: 26115 });
    expect(criarClubeResposta(clube, 4000)).toEqual({ id: 1, name: 'Águias FC', acronym: 'AGU', cash: 261.15, squad_value: 40, net_worth: 301.15 });
  });
});
