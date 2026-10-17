import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, FindOptionsWhere, In, IsNull } from 'typeorm';
import { formatarCentavos } from '@/core/comum/moeda/moeda';
import { Relogio } from '@/core/comum/relogio/relogio';
import { criarErroNaoEncontrado } from '@/core/erros/nao-encontrado';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { calcularValorDeMercado } from '@/modulos/jogadores/helpers/valor-de-mercado';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { ComprarJogadorDto } from '@/modulos/mercado/dto/comprar-jogador.dto';
import { HistoricoQueryDto } from '@/modulos/mercado/dto/historico-query.dto';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';
import { calcularComissao } from '@/modulos/mercado/helpers/comissao';
import { fidelidadeDentroDoPrazo } from '@/modulos/mercado/helpers/fidelidade';
import { calcularDiasRestantes, calcularMulta, percentualDeMulta } from '@/modulos/mercado/helpers/multa';
import { resumirHistorico } from '@/modulos/mercado/helpers/resumo-do-historico';
import type { ResumoDoHistorico } from '@/modulos/mercado/helpers/resumo-do-historico';
import { calcularTaxaDeCompra } from '@/modulos/mercado/helpers/taxa-de-compra';

const LIMITE_DO_ELENCO = 12;

export interface Compra {
  transacao: Transacao;
  contrato: Contrato;
  caixaDoClube: number;
}

export interface Venda extends Compra {
  diasRestantes: number;
  percentualDeMulta: number;
}

export interface Historico {
  transacoes: Transacao[];
  resumo: ResumoDoHistorico;
}

function valorDeMercadoDe(jogador: Jogador): number {
  return calcularValorDeMercado({ valorBaseCentavos: jogador.valorBase, condicao: jogador.condicao, agilidade: jogador.agilidade, idade: jogador.idade });
}

@Injectable()
export class MercadoService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly relogio: Relogio,
  ) {}

  // RN12 a RN14: o prazo vem antes de qualquer consulta (400 → 404 → 409, V9); o resto numa transação, com um só "agora"
  async comprar(jogadorId: number, dados: ComprarJogadorDto): Promise<Compra> {
    const agora = this.relogio.agora();
    if (!fidelidadeDentroDoPrazo(dados.loyalty_until, agora)) {
      throw new RegraNegocioException('A fidelidade deve terminar depois de agora e em até 1.095 dias.', 'FIDELIDADE_FORA_DO_PRAZO', HttpStatus.BAD_REQUEST);
    }
    return this.dataSource.transaction(async (manager) => {
      const jogador = await this.travarJogador(manager, jogadorId);
      const clube = await this.travarClube(manager, dados.club_id);
      if (jogador.clubeId !== null) {
        throw new RegraNegocioException('O jogador não está livre.', 'JOGADOR_NAO_ESTA_LIVRE');
      }
      if (await manager.existsBy(Transacao, { clubeId: clube.id, jogadorId, tipo: 'VENDA' })) {
        throw new RegraNegocioException('O clube não pode comprar um jogador que ele mesmo já vendeu.', 'RECOMPRA_PELO_CLUBE_VENDEDOR');
      }
      if ((await manager.countBy(Jogador, { clubeId: clube.id })) >= LIMITE_DO_ELENCO) {
        throw new RegraNegocioException(`O elenco já tem o máximo de ${LIMITE_DO_ELENCO} jogadores.`, 'ELENCO_CHEIO');
      }
      const valor = valorDeMercadoDe(jogador);
      const taxa = calcularTaxaDeCompra(valor);
      const custo = valor + taxa;
      // RN13: custo ≤ metade exata do caixa, comparado em inteiros (caixa 261,15 → limite 130,575)
      if (custo * 2 > clube.caixa) {
        throw new RegraNegocioException(`O custo da compra (${formatarCentavos(custo)}) passa de 50% do caixa (${formatarCentavos(clube.caixa)}).`, 'CUSTO_ACIMA_DO_LIMITE_DE_CAIXA');
      }
      clube.caixa -= custo;
      jogador.clubeId = clube.id;
      await manager.save(clube);
      await manager.save(jogador);
      const contrato = await manager.save(
        manager.create(Contrato, { jogadorId, clubeId: clube.id, valorCompra: valor, fidelidadeAte: dados.loyalty_until, situacao: 'ATIVO', iniciadoEm: agora, encerradoEm: null }),
      );
      const transacao = await manager.save(
        manager.create(Transacao, { clubeId: clube.id, jogadorId, nomeJogador: jogador.nome, tipo: 'COMPRA', valor, taxa, multa: 0, lucro: null, variacaoCaixa: -custo, criadoEm: agora }),
      );
      return { transacao, contrato, caixaDoClube: clube.caixa };
    });
  }

  // RN15, RN16 e RN19.5: tudo numa transação, com um só "agora"; o corpo do pedido é ignorado (AM-005)
  async vender(jogadorId: number): Promise<Venda> {
    const agora = this.relogio.agora();
    return this.dataSource.transaction(async (manager) => {
      const jogador = await this.travarJogador(manager, jogadorId);
      if (jogador.clubeId === null) {
        throw new RegraNegocioException('Jogador livre não pode ser vendido.', 'JOGADOR_LIVRE_NAO_PODE_SER_VENDIDO');
      }
      const clube = await this.travarClube(manager, jogador.clubeId);
      const contrato = await manager.findOneBy(Contrato, { jogadorId, clubeId: clube.id, situacao: 'ATIVO' });
      // Compra e venda gravam clube e contrato juntos (RN12, RN16): faltar o contrato é dado corrompido, e não regra de negócio
      if (!contrato) {
        throw new Error(`Jogador ${jogadorId} do clube ${clube.id} sem contrato ATIVO`);
      }
      const valor = valorDeMercadoDe(jogador);
      const diasRestantes = calcularDiasRestantes(contrato.fidelidadeAte, agora);
      const percentual = percentualDeMulta(diasRestantes);
      const multa = calcularMulta(valor, percentual);
      const lucro = valor - contrato.valorCompra;
      const comissao = calcularComissao(lucro);
      const credito = valor - multa - comissao;
      clube.caixa += credito;
      jogador.clubeId = null;
      contrato.situacao = multa > 0 ? 'RESCINDIDO' : 'ENCERRADO';
      contrato.encerradoEm = agora;
      await manager.save(clube);
      await manager.save(jogador);
      await manager.save(contrato);
      await manager.delete(Escalacao, { jogadorId });
      const transacao = await manager.save(
        manager.create(Transacao, { clubeId: clube.id, jogadorId, nomeJogador: jogador.nome, tipo: 'VENDA', valor, taxa: comissao, multa, lucro, variacaoCaixa: credito, criadoEm: agora }),
      );
      return { transacao, contrato, caixaDoClube: clube.caixa, diasRestantes, percentualDeMulta: percentual };
    });
  }

  // RN17: só leitura; clube e jogador do filtro conferidos antes (404), da mais recente para a mais antiga, valores como foram gravados
  async consultarHistorico(clubeId: number, filtros: HistoricoQueryDto): Promise<Historico> {
    const { manager } = this.dataSource;
    if (!(await manager.existsBy(Clube, { id: clubeId }))) {
      throw criarErroNaoEncontrado('clube');
    }
    if (filtros.player_id !== undefined && !(await manager.existsBy(Jogador, { id: filtros.player_id, excluidoEm: IsNull() }))) {
      throw criarErroNaoEncontrado('jogador');
    }
    const filtro: FindOptionsWhere<Transacao> = { clubeId };
    if (filtros.type !== undefined) {
      filtro.tipo = In(filtros.type);
    }
    if (filtros.player_id !== undefined) {
      filtro.jogadorId = filtros.player_id;
    }
    const transacoes = await manager.find(Transacao, { where: filtro, order: { criadoEm: 'DESC', id: 'DESC' } });
    return { transacoes, resumo: resumirHistorico(transacoes) };
  }

  // DEC-039: jogador primeiro, depois o clube, com SELECT ... FOR UPDATE; jogador excluído é inexistente (RN09)
  private async travarJogador(manager: EntityManager, id: number): Promise<Jogador> {
    const jogador = await manager.findOne(Jogador, { where: { id, excluidoEm: IsNull() }, lock: { mode: 'pessimistic_write' } });
    if (!jogador) {
      throw criarErroNaoEncontrado('jogador');
    }
    return jogador;
  }

  private async travarClube(manager: EntityManager, id: number): Promise<Clube> {
    const clube = await manager.findOne(Clube, { where: { id }, lock: { mode: 'pessimistic_write' } });
    if (!clube) {
      throw criarErroNaoEncontrado('clube');
    }
    return clube;
  }
}
