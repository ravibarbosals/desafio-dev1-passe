import { formatarDataHora } from '@/core/comum/data-hora/data-hora';
import { formatarCentavos } from '@/core/comum/moeda/moeda';
import type { Transacao } from '@/modulos/mercado/entities/transacao.entity';

export const CABECALHO_DO_CSV = 'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

export type TransacaoDoCsv = Pick<Transacao, 'criadoEm' | 'tipo' | 'nomeJogador' | 'valor' | 'taxa' | 'multa' | 'lucro' | 'variacaoCaixa'>;

// RN18.6: nome com ; ou " vai entre aspas, com cada aspa interna duplicada
function escaparNome(nome: string): string {
  return /[;"]/.test(nome) ? `"${nome.replaceAll('"', '""')}"` : nome;
}

// RN18: cabeçalho fixo, uma linha por transação na ordem recebida, separador ; e \n no fim de toda linha, inclusive a última
export function gerarCsvDoHistorico(transacoes: TransacaoDoCsv[]): string {
  const linhas = transacoes.map((transacao) =>
    [
      formatarDataHora(transacao.criadoEm),
      transacao.tipo,
      escaparNome(transacao.nomeJogador),
      formatarCentavos(transacao.valor),
      formatarCentavos(transacao.taxa),
      formatarCentavos(transacao.multa),
      transacao.lucro === null ? '' : formatarCentavos(transacao.lucro),
      formatarCentavos(transacao.variacaoCaixa),
    ].join(';'),
  );
  return [CABECALHO_DO_CSV, ...linhas].map((linha) => `${linha}\n`).join('');
}
