import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, IsNull } from 'typeorm';
import { Relogio } from '@/core/comum/relogio/relogio';
import { criarErroNaoEncontrado } from '@/core/erros/nao-encontrado';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { compararOrdemDoElenco } from '@/modulos/jogadores/helpers/ordem-do-elenco';
import { EscalarDto } from '@/modulos/liga/dto/escalar.dto';
import { JogarPartidaDto } from '@/modulos/liga/dto/jogar-partida.dto';
import { ListarPartidasQueryDto } from '@/modulos/liga/dto/listar-partidas-query.dto';
import { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { Partida } from '@/modulos/liga/entities/partida.entity';
import { calcularClassificacao } from '@/modulos/liga/helpers/classificacao';
import type { LinhaDaClassificacao } from '@/modulos/liga/helpers/classificacao';
import { posicoesFechamAFormacao } from '@/modulos/liga/helpers/formacao';
import { jogarPartida } from '@/modulos/liga/helpers/partida';
import type { TimeDaPartida } from '@/modulos/liga/helpers/partida';

export interface EscalacaoDoClube {
  clube: Clube;
  titulares: Jogador[];
}

interface TimeEscalado {
  time: TimeDaPartida;
  formacao: string;
}

// RN20.3: conta só quem ainda é do clube e não está DOENTE; o jogador travado é a versão mais nova (pode ter sido vendido enquanto a partida esperava a trava)
function montarTime(clube: Clube, escalacoes: Escalacao[]): TimeEscalado {
  const linhas = escalacoes.filter((linha) => linha.clubeId === clube.id);
  const titulares = linhas.map((linha) => linha.jogador).filter((jogador): jogador is Jogador => jogador?.clubeId === clube.id && jogador.condicao !== 'DOENTE');
  const formacao = linhas[0]?.clube?.formacao;
  if (titulares.length !== 5 || !formacao) {
    throw new RegraNegocioException(`O clube ${clube.nome} não tem a escalação completa.`, 'ESCALACAO_INCOMPLETA');
  }
  return { time: { clubeId: clube.id, titulares }, formacao };
}

@Injectable()
export class LigaService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly relogio: Relogio,
  ) {}

  // RN19: 404 do clube antes do dos jogadores; trava os 5 jogadores em ordem de id e depois o clube (DEC-039); substitui a escalação inteira
  async escalar(clubeId: number, dados: EscalarDto): Promise<EscalacaoDoClube> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await manager.existsBy(Clube, { id: clubeId }))) {
        throw criarErroNaoEncontrado('clube');
      }
      const titulares = await manager.find(Jogador, { where: { id: In(dados.player_ids), excluidoEm: IsNull() }, order: { id: 'ASC' }, lock: { mode: 'pessimistic_write' } });
      if (titulares.length !== dados.player_ids.length) {
        throw criarErroNaoEncontrado('jogador');
      }
      const clube = await manager.findOneOrFail(Clube, { where: { id: clubeId }, lock: { mode: 'pessimistic_write' } });
      const deFora = titulares.find((jogador) => jogador.clubeId !== clubeId);
      if (deFora) {
        throw new RegraNegocioException(`O jogador ${deFora.nome} não é do elenco do ${clube.nome}.`, 'JOGADOR_FORA_DO_ELENCO');
      }
      const doente = titulares.find((jogador) => jogador.condicao === 'DOENTE');
      if (doente) {
        throw new RegraNegocioException(`O jogador ${doente.nome} está DOENTE e não pode ser escalado.`, 'JOGADOR_DOENTE_NAO_PODE_SER_ESCALADO');
      }
      const posicoes = titulares.map((jogador) => jogador.posicao);
      if (!posicoesFechamAFormacao(dados.formation, posicoes)) {
        throw new RegraNegocioException(`As posições dos titulares não fecham a formação ${dados.formation}.`, 'POSICOES_NAO_FECHAM_A_FORMACAO');
      }
      const agora = this.relogio.agora();
      await manager.delete(Escalacao, { clubeId });
      await manager.save(titulares.map((jogador) => manager.create(Escalacao, { clubeId, jogadorId: jogador.id, criadoEm: agora })));
      clube.formacao = dados.formation;
      await manager.save(clube);
      return { clube, titulares: titulares.sort(compararOrdemDoElenco) };
    });
  }

  // RN20: os clubes só são lidos (404, sem trava); escalação, titulares e formação vêm numa consulta que trava só os jogadores (DEC-039)
  async jogar(dados: JogarPartidaDto): Promise<Partida> {
    return this.dataSource.transaction(async (manager) => {
      const mandante = await manager.findOneBy(Clube, { id: dados.home_club_id });
      if (!mandante) {
        throw criarErroNaoEncontrado('clube');
      }
      const visitante = await manager.findOneBy(Clube, { id: dados.away_club_id });
      if (!visitante) {
        throw criarErroNaoEncontrado('clube');
      }
      const escalacoes = await this.lerEscalacoesTravandoJogadores(manager, [mandante.id, visitante.id]);
      const timeMandante = montarTime(mandante, escalacoes);
      const timeVisitante = montarTime(visitante, escalacoes);
      const placar = jogarPartida(timeMandante.time, timeVisitante.time);
      const partida = await manager.save(
        manager.create(Partida, {
          mandanteId: mandante.id,
          visitanteId: visitante.id,
          golsMandante: placar.golsMandante,
          golsVisitante: placar.golsVisitante,
          formacaoMandante: timeMandante.formacao,
          formacaoVisitante: timeVisitante.formacao,
          jogadaEm: this.relogio.agora(),
        }),
      );
      const duelos = await manager.save(placar.duelos.map((duelo) => manager.create(DueloPartida, { ...duelo, partidaId: partida.id })));
      return Object.assign(partida, { mandante, visitante, duelos });
    });
  }

  // RN19.6: titulares que restam, na ordem do elenco; sem escalação, formação null e lista vazia
  async consultarEscalacao(clubeId: number): Promise<EscalacaoDoClube> {
    const { manager } = this.dataSource;
    const clube = await manager.findOneBy(Clube, { id: clubeId });
    if (!clube) {
      throw criarErroNaoEncontrado('clube');
    }
    const escalacao = await manager.find(Escalacao, { where: { clubeId }, relations: { jogador: true } });
    const titulares = escalacao.map(({ jogador }) => {
      if (!jogador) {
        throw new Error(`Escalação do clube ${clubeId} sem o jogador`);
      }
      return jogador;
    });
    return { clube, titulares: titulares.sort(compararOrdemDoElenco) };
  }

  // RN21: da mais recente para a mais antiga (id desempata a mesma jogada_em); o filtro pega o clube como mandante ou visitante
  async listarPartidas(filtros: ListarPartidasQueryDto): Promise<Partida[]> {
    const { manager } = this.dataSource;
    const clubeId = filtros.club_id;
    if (clubeId !== undefined && !(await manager.existsBy(Clube, { id: clubeId }))) {
      throw criarErroNaoEncontrado('clube');
    }
    return manager.find(Partida, {
      where: clubeId === undefined ? {} : [{ mandanteId: clubeId }, { visitanteId: clubeId }],
      relations: { mandante: true, visitante: true },
      order: { jogadaEm: 'DESC', id: 'DESC' },
    });
  }

  // RN21: a partida com os clubes e os 6 duelos; id inexistente → 404 (nunca 200 vazio)
  async consultarPartida(id: number): Promise<Partida> {
    const partida = await this.dataSource.manager.findOne(Partida, { where: { id }, relations: { mandante: true, visitante: true, duelos: true } });
    if (!partida) {
      throw criarErroNaoEncontrado('partida');
    }
    return partida;
  }

  // RN21: calculada a cada consulta, nunca gravada. Partidas antes dos clubes: todo clube de uma partida já lida aparece na leitura seguinte (clube nunca é apagado)
  async consultarClassificacao(): Promise<LinhaDaClassificacao[]> {
    const { manager } = this.dataSource;
    const partidas = await manager.find(Partida, { select: { mandanteId: true, visitanteId: true, golsMandante: true, golsVisitante: true } });
    const clubes = await manager.find(Clube, { select: { id: true, nome: true } });
    return calcularClassificacao(clubes, partidas);
  }

  // FOR UPDATE OF jogadores: em ordem de id, sem travar escalacoes nem clubes, para não fechar ciclo com o PUT /lineup e a venda (RN20)
  private lerEscalacoesTravandoJogadores(manager: EntityManager, clubeIds: number[]): Promise<Escalacao[]> {
    return manager
      .createQueryBuilder(Escalacao, 'escalacao')
      .innerJoinAndSelect('escalacao.jogador', 'jogador')
      .innerJoinAndSelect('escalacao.clube', 'clube')
      .where('escalacao.clube_id IN (:...clubeIds)', { clubeIds })
      .orderBy('jogador.id', 'ASC')
      .setLock('pessimistic_write', undefined, ['jogador'])
      .getMany();
  }
}
