import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { restricaoViolada, SqlState, temSqlState } from '@/core/banco/sql-state';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { CriarClubeDto } from '@/modulos/clubes/dto/criar-clube.dto';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { normalizarNomeDeClube } from '@/modulos/clubes/helpers/nome-de-clube';

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

@Injectable()
export class ClubesService {
  constructor(private readonly dataSource: DataSource) {}

  // RN10: caixa 300,00 (default), sem elenco e sem formação; limite de 20 contado com a trava, e nome e sigla livres
  async criar(dados: CriarClubeDto): Promise<Clube> {
    try {
      return await this.dataSource.transaction((manager) => this.criarComTrava(manager, dados));
    } catch (erro) {
      const traduzir = temSqlState(erro, SqlState.ViolacaoDeUnicidade) ? ERROS_POR_INDICE[restricaoViolada(erro) ?? ''] : undefined;
      throw traduzir ? traduzir() : erro;
    }
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
