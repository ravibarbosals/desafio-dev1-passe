import { CABECALHO_DO_CSV, gerarCsvDoHistorico } from '@/modulos/mercado/helpers/csv-do-historico';
import type { TransacaoDoCsv } from '@/modulos/mercado/helpers/csv-do-historico';

// Compra e venda do Meia Lua no Águias FC (exemplo da RN18)
const venda: TransacaoDoCsv = {
  criadoEm: new Date('2026-11-05T19:40:00Z'),
  tipo: 'VENDA',
  nomeJogador: 'Meia Lua',
  valor: 4000,
  taxa: 30,
  multa: 400,
  lucro: 300,
  variacaoCaixa: 3570,
};
const compra: TransacaoDoCsv = {
  criadoEm: new Date('2026-11-02T13:15:00Z'),
  tipo: 'COMPRA',
  nomeJogador: 'Meia Lua',
  valor: 3700,
  taxa: 185,
  multa: 0,
  lucro: null,
  variacaoCaixa: -3885,
};

describe('gerarCsvDoHistorico', () => {
  it('reproduz o exemplo da RN18 byte a byte', () => {
    expect(gerarCsvDoHistorico([venda, compra])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n' +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('sem transações: só o cabeçalho, terminado em \\n (RN18.4)', () => {
    expect(gerarCsvDoHistorico([])).toBe(`${CABECALHO_DO_CSV}\n`);
  });

  it('mantém a ordem recebida, sem reordenar', () => {
    const linhas = gerarCsvDoHistorico([compra, venda]).split('\n');
    expect(linhas[1]).toMatch(/;COMPRA;/);
    expect(linhas[2]).toMatch(/;VENDA;/);
  });

  it('lucro negativo com parte inteira zero mantém o sinal: -0,39', () => {
    expect(gerarCsvDoHistorico([{ ...venda, lucro: -39 }])).toContain(';4,00;-0,39;35,70\n');
  });

  it('nome com aspas vai entre aspas, com as internas duplicadas', () => {
    expect(gerarCsvDoHistorico([{ ...venda, nomeJogador: 'Zé "Foguete" Lima' }])).toContain(';VENDA;"Zé ""Foguete"" Lima";40,00;');
  });

  it('nome com ; vai entre aspas', () => {
    expect(gerarCsvDoHistorico([{ ...venda, nomeJogador: 'Meia;Lua' }])).toContain(';VENDA;"Meia;Lua";40,00;');
  });

  it('nome sem ; nem aspas, com acento, sai como está', () => {
    expect(gerarCsvDoHistorico([{ ...venda, nomeJogador: "Zé D'Ávila" }])).toContain(";VENDA;Zé D'Ávila;40,00;");
  });
});
