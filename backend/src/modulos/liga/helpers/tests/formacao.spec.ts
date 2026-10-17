import { posicoesFechamAFormacao } from '@/modulos/liga/helpers/formacao';
import type { Formacao } from '@/modulos/liga/helpers/formacao';
import type { PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';

describe('posicoesFechamAFormacao', () => {
  // Exemplos de escalação da tabela de formações (RN19), fora da ordem do elenco
  it.each<[Formacao, PosicaoJogador[]]>([
    ['3-1', ['ATA', 'LAT', 'GOL', 'ZAG', 'LAT']],
    ['2-2', ['ATA', 'GOL', 'ZAG', 'ATA', 'LAT']],
    ['2-1-1', ['MEI', 'ATA', 'LAT', 'GOL', 'ZAG']],
    ['1-2-1', ['MEI', 'GOL', 'ATA', 'ZAG', 'MEI']],
  ])('%s fecha com %j', (formacao, posicoes) => {
    expect(posicoesFechamAFormacao(formacao, posicoes)).toBe(true);
  });

  it('na defesa, ZAG e LAT contam juntos: 3-1 com 3 ZAG ou 3 LAT', () => {
    expect(posicoesFechamAFormacao('3-1', ['GOL', 'ZAG', 'ZAG', 'ZAG', 'ATA'])).toBe(true);
    expect(posicoesFechamAFormacao('3-1', ['GOL', 'LAT', 'LAT', 'LAT', 'ATA'])).toBe(true);
  });

  it.each<[string, Formacao, PosicaoJogador[]]>([
    ['2-1-1 com 2 MEI (B20)', '2-1-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA']],
    ['2 GOL', '2-1-1', ['GOL', 'GOL', 'LAT', 'MEI', 'ATA']],
    ['sem GOL', '3-1', ['ZAG', 'ZAG', 'LAT', 'LAT', 'ATA']],
    ['defesa a menos', '3-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
    ['ataque a menos', '2-2', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA']],
    ['meio a menos', '1-2-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['ataque a mais', '2-1-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
    ['só os 4 jogadores de linha, sem GOL', '2-1-1', ['ZAG', 'LAT', 'MEI', 'ATA']],
  ])('não fecha: %s', (_caso, formacao, posicoes) => {
    expect(posicoesFechamAFormacao(formacao, posicoes)).toBe(false);
  });
});
