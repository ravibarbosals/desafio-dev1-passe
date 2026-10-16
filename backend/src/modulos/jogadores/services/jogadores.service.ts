import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { calcularOverall } from '@/modulos/jogadores/helpers/overall';
import { calcularValorBase } from '@/modulos/jogadores/helpers/valor-base';

// Catálogo de erros (regras-negocio/README.md): o mesmo 404 para id fora do formato (V8), inexistente ou excluído (RN09)
export const CODIGO_JOGADOR_NAO_ENCONTRADO = 'JOGADOR_NAO_ENCONTRADO';
export const MENSAGEM_JOGADOR_NAO_ENCONTRADO = 'Jogador não encontrado.';

@Injectable()
export class JogadoresService {
  constructor(@InjectRepository(Jogador) private readonly jogadores: Repository<Jogador>) {}

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
      throw new RegraNegocioException(MENSAGEM_JOGADOR_NAO_ENCONTRADO, CODIGO_JOGADOR_NAO_ENCONTRADO, HttpStatus.NOT_FOUND);
    }
    return jogador;
  }
}
