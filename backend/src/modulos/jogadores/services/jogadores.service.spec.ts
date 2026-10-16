import { IsNull, Repository } from 'typeorm';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { JogadoresService } from '@/modulos/jogadores/services/jogadores.service';

// Repositório simulado: create devolve a entity, save devolve o que receberia do banco
function criarRepositorio() {
  return {
    create: vi.fn((dados: Partial<Jogador>) => Object.assign(new Jogador(), dados)),
    save: vi.fn((jogador: Jogador) => Promise.resolve(Object.assign(jogador, { id: 2, condicao: 'APTO' }))),
    findOneBy: vi.fn(),
  };
}

function criarServico(repositorio: ReturnType<typeof criarRepositorio>): JogadoresService {
  return new JogadoresService(repositorio as unknown as Repository<Jogador>);
}

const dados = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
} satisfies CriarJogadorDto;

describe('JogadoresService.cadastrar', () => {
  it('grava o jogador livre, com o valor base da RN06 em centavos', async () => {
    const repositorio = criarRepositorio();
    const jogador = await criarServico(repositorio).cadastrar(dados);
    expect(repositorio.create).toHaveBeenCalledWith({
      nome: 'Meia Lua',
      posicao: 'MEI',
      agilidade: 85,
      idade: 25,
      velocidade: 70,
      finalizacao: 68,
      passe: 82,
      drible: 79,
      defesa: 55,
      fisico: 64,
      potencial: 86,
      valorBase: 4000,
      clubeId: null,
      excluidoEm: null,
    });
    expect(jogador).toMatchObject({ id: 2, valorBase: 4000, clubeId: null });
  });

  it('usa a idade do cadastro na jovem promessa (overall 45, potencial 90, 18 anos → 3,63)', async () => {
    const repositorio = criarRepositorio();
    // ZAG com os atributos abaixo dá overall 45
    await criarServico(repositorio).cadastrar({ ...dados, position: 'ZAG', age: 18, pace: 45, shooting: 45, passing: 45, dribbling: 45, defending: 45, physical: 45, potential: 90 });
    expect(repositorio.create).toHaveBeenCalledWith(expect.objectContaining({ valorBase: 363 }));
  });
});

describe('JogadoresService.consultar', () => {
  it('busca só entre os jogadores não excluídos (RN09)', async () => {
    const repositorio = criarRepositorio();
    const jogador = Object.assign(new Jogador(), { id: 7 });
    repositorio.findOneBy.mockResolvedValue(jogador);
    await expect(criarServico(repositorio).consultar(7)).resolves.toBe(jogador);
    expect(repositorio.findOneBy).toHaveBeenCalledWith({ id: 7, excluidoEm: IsNull() });
  });

  it('responde 404 JOGADOR_NAO_ENCONTRADO para inexistente ou excluído', async () => {
    const repositorio = criarRepositorio();
    repositorio.findOneBy.mockResolvedValue(null);
    await expect(criarServico(repositorio).consultar(7)).rejects.toThrow(RegraNegocioException);
    await expect(criarServico(repositorio).consultar(7)).rejects.toMatchObject({ codigo: 'JOGADOR_NAO_ENCONTRADO', status: 404, message: 'Jogador não encontrado.' });
  });
});
