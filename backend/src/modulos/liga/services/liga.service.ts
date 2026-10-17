import { Injectable } from '@nestjs/common';
import { DataSource, In, IsNull } from 'typeorm';
import { Relogio } from '@/core/comum/relogio/relogio';
import { criarErroNaoEncontrado } from '@/core/erros/nao-encontrado';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { compararOrdemDoElenco } from '@/modulos/jogadores/helpers/ordem-do-elenco';
import { EscalarDto } from '@/modulos/liga/dto/escalar.dto';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { posicoesFechamAFormacao } from '@/modulos/liga/helpers/formacao';

export interface EscalacaoDoClube {
  clube: Clube;
  titulares: Jogador[];
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
}
