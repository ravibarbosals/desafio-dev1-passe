import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, EntityManager, FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { contemTexto } from '@/core/comum/texto/texto';
import { criarErroNaoEncontrado } from '@/core/erros/nao-encontrado';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { AlterarCondicaoDto } from '@/modulos/jogadores/dto/alterar-condicao.dto';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { EditarJogadorDto } from '@/modulos/jogadores/dto/editar-jogador.dto';
import { ListarJogadoresQueryDto } from '@/modulos/jogadores/dto/listar-jogadores-query.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { criarComparadorDaListagem } from '@/modulos/jogadores/helpers/ordenacao-da-listagem';
import { calcularOverall } from '@/modulos/jogadores/helpers/overall';
import { Pagina, paginar } from '@/modulos/jogadores/helpers/paginacao';
import { calcularValorBase } from '@/modulos/jogadores/helpers/valor-base';
import { calcularValorDeMercado } from '@/modulos/jogadores/helpers/valor-de-mercado';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';

const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 45;

// DEC-038: o banco aplica só os filtros de coluna simples; vindo só um limite de idade, o outro é o extremo da faixa
function montarFiltroDoBanco(filtros: ListarJogadoresQueryDto): FindOptionsWhere<Jogador> {
  const filtro: FindOptionsWhere<Jogador> = { excluidoEm: IsNull() };
  if (filtros.position !== undefined) {
    filtro.posicao = filtros.position;
  }
  if (filtros.condition !== undefined) {
    filtro.condicao = filtros.condition;
  }
  if (filtros.club_id !== undefined) {
    filtro.clubeId = filtros.club_id;
  } else if (filtros.free !== undefined) {
    filtro.clubeId = filtros.free ? IsNull() : Not(IsNull());
  }
  if (filtros.min_age !== undefined || filtros.max_age !== undefined) {
    filtro.idade = Between(filtros.min_age ?? IDADE_MINIMA, filtros.max_age ?? IDADE_MAXIMA);
  }
  return filtro;
}

@Injectable()
export class JogadoresService {
  constructor(
    @InjectRepository(Jogador) private readonly jogadores: Repository<Jogador>,
    @InjectRepository(Clube) private readonly clubes: Repository<Clube>,
    private readonly dataSource: DataSource,
  ) {}

  // Nasce livre e APTO (default do banco); o valor base usa o overall da posição e a idade do cadastro e não é recalculado (RN06)
  async cadastrar(dados: CriarJogadorDto): Promise<Jogador> {
    const atributos = {
      velocidade: dados.pace,
      finalizacao: dados.shooting,
      passe: dados.passing,
      drible: dados.dribbling,
      defesa: dados.defending,
      fisico: dados.physical,
    };
    const overall = calcularOverall({ posicao: dados.position, atributos });
    const jogador = this.jogadores.create({
      nome: dados.name,
      posicao: dados.position,
      agilidade: dados.agility,
      idade: dados.age,
      ...atributos,
      potencial: dados.potential,
      valorBase: calcularValorBase({ overall, potencial: dados.potential, idadeNoCadastro: dados.age }),
      clubeId: null,
      excluidoEm: null,
    });
    return this.jogadores.save(jogador);
  }

  // RN09: jogador excluído é inexistente
  async consultar(id: number): Promise<Jogador> {
    const jogador = await this.jogadores.findOneBy({ id, excluidoEm: IsNull() });
    if (!jogador) {
      throw criarErroNaoEncontrado('jogador');
    }
    return jogador;
  }

  // RN07 e DEC-038: banco filtra as colunas; a memória faz busca, valor de mercado, faixa de valor, ordenação e paginação
  async listar(filtros: ListarJogadoresQueryDto): Promise<Pagina<Jogador>> {
    if (filtros.club_id !== undefined && !(await this.clubes.existsBy({ id: filtros.club_id }))) {
      throw criarErroNaoEncontrado('clube');
    }
    const jogadores = await this.jogadores.find({ where: montarFiltroDoBanco(filtros) });
    const itens = jogadores
      .filter((jogador) => filtros.search === undefined || contemTexto(jogador.nome, filtros.search))
      .map((jogador) => ({
        jogador,
        valorDeMercado: calcularValorDeMercado({ valorBaseCentavos: jogador.valorBase, condicao: jogador.condicao, agilidade: jogador.agilidade, idade: jogador.idade }),
      }))
      .filter(({ valorDeMercado }) => (filtros.min_value === undefined || valorDeMercado >= filtros.min_value) && (filtros.max_value === undefined || valorDeMercado <= filtros.max_value))
      .sort(criarComparadorDaListagem(filtros.sort ?? ['name']));
    const pagina = paginar(itens, filtros.page ?? 1, filtros.limit ?? 10);
    return { ...pagina, itens: pagina.itens.map(({ jogador }) => jogador) };
  }

  // RN08: só nome, posição, agilidade e idade mudam; o jogador fica travado entre a leitura e a gravação (DEC-024, DEC-039)
  async editar(id: number, dados: EditarJogadorDto): Promise<Jogador> {
    return this.dataSource.transaction(async (manager) => {
      const jogador = await this.travarJogador(manager, id);
      // PR-003: reenviar a mesma posição é aceito
      if (jogador.clubeId !== null && dados.position !== jogador.posicao) {
        throw new RegraNegocioException('Jogador com clube não pode mudar de posição.', 'POSICAO_BLOQUEADA_COM_CLUBE');
      }
      if (dados.age < jogador.idade) {
        throw new RegraNegocioException('A idade do jogador não pode diminuir.', 'IDADE_NAO_PODE_DIMINUIR');
      }
      Object.assign(jogador, { nome: dados.name, posicao: dados.position, agilidade: dados.agility, idade: dados.age });
      return manager.save(jogador);
    });
  }

  // Limites (condition): DOENTE só volta a APTO passando por MAL_CONDICIONADO; quem fica DOENTE sai da escalação na mesma transação, e a formação do clube fica (RN19.5)
  async alterarCondicao(id: number, dados: AlterarCondicaoDto): Promise<Jogador> {
    return this.dataSource.transaction(async (manager) => {
      const jogador = await this.travarJogador(manager, id);
      if (jogador.condicao === 'DOENTE' && dados.condition === 'APTO') {
        throw new RegraNegocioException('Jogador doente precisa passar por MAL_CONDICIONADO antes de voltar a APTO.', 'DOENTE_NAO_VAI_DIRETO_PARA_APTO');
      }
      if (dados.condition === 'DOENTE') {
        await manager.delete(Escalacao, { jogadorId: id });
      }
      jogador.condicao = dados.condition;
      return manager.save(jogador);
    });
  }

  // Lê o jogador ativo com SELECT ... FOR UPDATE (DEC-039); excluído é inexistente (RN09)
  private async travarJogador(manager: EntityManager, id: number): Promise<Jogador> {
    const jogador = await manager.findOne(Jogador, { where: { id, excluidoEm: IsNull() }, lock: { mode: 'pessimistic_write' } });
    if (!jogador) {
      throw criarErroNaoEncontrado('jogador');
    }
    return jogador;
  }
}
