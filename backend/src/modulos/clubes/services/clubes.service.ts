import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { restricaoViolada, SqlState, temSqlState } from '@/core/banco/sql-state';
import { Relogio } from '@/core/comum/relogio/relogio';
import { criarErroNaoEncontrado } from '@/core/erros/nao-encontrado';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { CriarClubeDto } from '@/modulos/clubes/dto/criar-clube.dto';
import { ListarClubesQueryDto } from '@/modulos/clubes/dto/listar-clubes-query.dto';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { normalizarNomeDeClube } from '@/modulos/clubes/helpers/nome-de-clube';
import { criarComparadorDeClubes } from '@/modulos/clubes/helpers/ordenacao-de-clubes';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { compararOrdemDoElenco } from '@/modulos/jogadores/helpers/ordem-do-elenco';
import { calcularValorDeMercado } from '@/modulos/jogadores/helpers/valor-de-mercado';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { calcularDiasRestantes, percentualDeMulta } from '@/modulos/mercado/helpers/multa';

const LIMITE_DE_CLUBES = 20;
// DEC-039: chave fixa do pg_advisory_xact_lock que serializa as criações de clube
const TRAVA_DA_CRIACAO_DE_CLUBES = 10;

function erroDeNomeRepetido(): RegraNegocioException {
  return new RegraNegocioException('Já existe um clube com este nome.', 'NOME_DE_CLUBE_JA_CADASTRADO');
}

function erroDeSiglaRepetida(): RegraNegocioException {
  return new RegraNegocioException('Já existe um clube com esta sigla.', 'SIGLA_JA_CADASTRADA');
}

// Índices únicos da migration de clubes: a violação (23505) vira o mesmo 409 da verificação (RN10)
const ERROS_POR_INDICE: Record<string, () => RegraNegocioException> = {
  uq_clubes_nome_normalizado: erroDeNomeRepetido,
  uq_clubes_sigla: erroDeSiglaRepetida,
};

export interface ClubeComValores {
  clube: Clube;
  valorDoElenco: number;
}

export interface JogadorComContrato {
  jogador: Jogador;
  contrato: Contrato;
  diasRestantes: number;
  percentualDeMulta: number;
}

export interface ClubeComElenco extends ClubeComValores {
  elenco: JogadorComContrato[];
}

function valorDeMercadoDe(jogador: Jogador): number {
  return calcularValorDeMercado({ valorBaseCentavos: jogador.valorBase, condicao: jogador.condicao, agilidade: jogador.agilidade, idade: jogador.idade });
}

@Injectable()
export class ClubesService {
  constructor(
    @InjectRepository(Clube) private readonly clubes: Repository<Clube>,
    @InjectRepository(Jogador) private readonly jogadores: Repository<Jogador>,
    @InjectRepository(Contrato) private readonly contratos: Repository<Contrato>,
    private readonly dataSource: DataSource,
    private readonly relogio: Relogio,
  ) {}

  // RN10: caixa 300,00 (default), sem elenco e sem formação; limite de 20 contado com a trava, e nome e sigla livres
  async criar(dados: CriarClubeDto): Promise<Clube> {
    try {
      return await this.dataSource.transaction((manager) => this.criarComTrava(manager, dados));
    } catch (erro) {
      const traduzir = temSqlState(erro, SqlState.ViolacaoDeUnicidade) ? ERROS_POR_INDICE[restricaoViolada(erro) ?? ''] : undefined;
      throw traduzir ? traduzir() : erro;
    }
  }

  async listar(filtros: ListarClubesQueryDto): Promise<ClubeComValores[]> {
    const [clubes, elencos] = await Promise.all([this.clubes.find(), this.jogadores.find({ where: { clubeId: Not(IsNull()), excluidoEm: IsNull() } })]);
    const valorPorClube = new Map<number, number>();
    for (const jogador of elencos) {
      if (jogador.clubeId !== null) {
        valorPorClube.set(jogador.clubeId, (valorPorClube.get(jogador.clubeId) ?? 0) + valorDeMercadoDe(jogador));
      }
    }
    return clubes
      .map((clube) => {
        const valorDoElenco = valorPorClube.get(clube.id) ?? 0;
        return { clube, valorDoElenco, patrimonio: clube.caixa + valorDoElenco };
      })
      .sort(criarComparadorDeClubes(filtros.sort ?? 'name'));
  }

  // RN11: elenco na ordem GOL→ATA, nome e id, cada jogador com o contrato ATIVO
  async consultar(id: number): Promise<ClubeComElenco> {
    const clube = await this.clubes.findOneBy({ id });
    if (!clube) {
      throw criarErroNaoEncontrado('clube');
    }
    const [jogadores, contratos] = await Promise.all([this.jogadores.find({ where: { clubeId: id, excluidoEm: IsNull() } }), this.contratos.find({ where: { clubeId: id, situacao: 'ATIVO' } })]);
    const contratoPorJogador = new Map(contratos.map((contrato) => [contrato.jogadorId, contrato]));
    const agora = this.relogio.agora();
    const elenco = jogadores.sort(compararOrdemDoElenco).map((jogador) => {
      const contrato = contratoPorJogador.get(jogador.id);
      // Compra e venda gravam clube e contrato juntos (RN12, RN16): faltar o contrato é dado corrompido, e não regra de negócio
      if (!contrato) {
        throw new Error(`Jogador ${jogador.id} do clube ${id} sem contrato ATIVO`);
      }
      const diasRestantes = calcularDiasRestantes(contrato.fidelidadeAte, agora);
      return { jogador, contrato, diasRestantes, percentualDeMulta: percentualDeMulta(diasRestantes) };
    });
    return { clube, valorDoElenco: jogadores.reduce((soma, jogador) => soma + valorDeMercadoDe(jogador), 0), elenco };
  }

  private async criarComTrava(manager: EntityManager, dados: CriarClubeDto): Promise<Clube> {
    await manager.query('SELECT pg_advisory_xact_lock($1)', [TRAVA_DA_CRIACAO_DE_CLUBES]);
    if ((await manager.count(Clube)) >= LIMITE_DE_CLUBES) {
      throw new RegraNegocioException(`A liga já tem o máximo de ${LIMITE_DE_CLUBES} clubes.`, 'LIMITE_DE_CLUBES_ATINGIDO');
    }
    const nomeNormalizado = normalizarNomeDeClube(dados.name);
    if (await manager.existsBy(Clube, { nomeNormalizado })) {
      throw erroDeNomeRepetido();
    }
    if (await manager.existsBy(Clube, { sigla: dados.acronym })) {
      throw erroDeSiglaRepetida();
    }
    return manager.save(manager.create(Clube, { nome: dados.name, nomeNormalizado, sigla: dados.acronym, formacao: null }));
  }
}
