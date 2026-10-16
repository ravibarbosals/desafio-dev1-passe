import { Between, IsNull, Not, Repository } from 'typeorm';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { JogadoresService } from '@/modulos/jogadores/services/jogadores.service';

// Repositórios simulados: create devolve a entity, save devolve o que receberia do banco
function criarRepositorios() {
  const jogadores = {
    create: vi.fn((dados: Partial<Jogador>) => Object.assign(new Jogador(), dados)),
    save: vi.fn((jogador: Jogador) => Promise.resolve(Object.assign(jogador, { id: 2, condicao: 'APTO' }))),
    findOneBy: vi.fn(),
    find: vi.fn().mockResolvedValue([]),
  };
  const clubes = { existsBy: vi.fn().mockResolvedValue(true) };
  return { jogadores, clubes };
}

function criarServico({ jogadores, clubes }: ReturnType<typeof criarRepositorios>): JogadoresService {
  return new JogadoresService(jogadores as unknown as Repository<Jogador>, clubes as unknown as Repository<Clube>);
}

// Jogador APTO de 25 anos: o valor de mercado é igual ao valor base
function criarJogador(id: number, nome: string, valorBase: number, campos: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), { id, nome, valorBase, posicao: 'MEI', condicao: 'APTO', agilidade: 50, idade: 25, clubeId: null, ...campos });
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
    const repositorios = criarRepositorios();
    const jogador = await criarServico(repositorios).cadastrar(dados);
    expect(repositorios.jogadores.create).toHaveBeenCalledWith({
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
    const repositorios = criarRepositorios();
    // ZAG com os atributos abaixo dá overall 45
    await criarServico(repositorios).cadastrar({ ...dados, position: 'ZAG', age: 18, pace: 45, shooting: 45, passing: 45, dribbling: 45, defending: 45, physical: 45, potential: 90 });
    expect(repositorios.jogadores.create).toHaveBeenCalledWith(expect.objectContaining({ valorBase: 363 }));
  });
});

describe('JogadoresService.consultar', () => {
  it('busca só entre os jogadores não excluídos (RN09)', async () => {
    const repositorios = criarRepositorios();
    const jogador = Object.assign(new Jogador(), { id: 7 });
    repositorios.jogadores.findOneBy.mockResolvedValue(jogador);
    await expect(criarServico(repositorios).consultar(7)).resolves.toBe(jogador);
    expect(repositorios.jogadores.findOneBy).toHaveBeenCalledWith({ id: 7, excluidoEm: IsNull() });
  });

  it('responde 404 JOGADOR_NAO_ENCONTRADO para inexistente ou excluído', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.findOneBy.mockResolvedValue(null);
    await expect(criarServico(repositorios).consultar(7)).rejects.toThrow(RegraNegocioException);
    await expect(criarServico(repositorios).consultar(7)).rejects.toMatchObject({ codigo: 'JOGADOR_NAO_ENCONTRADO', status: 404, message: 'Jogador não encontrado.' });
  });
});

describe('JogadoresService.listar', () => {
  it('manda ao banco só os filtros de coluna, sempre sem os excluídos (DEC-038)', async () => {
    const repositorios = criarRepositorios();
    await criarServico(repositorios).listar({ position: 'ZAG', condition: 'DOENTE', club_id: 3, free: false, min_age: 20 });
    expect(repositorios.jogadores.find).toHaveBeenCalledWith({ where: { excluidoEm: IsNull(), posicao: 'ZAG', condicao: 'DOENTE', clubeId: 3, idade: Between(20, 45) } });
  });

  it.each([
    [true, IsNull()],
    [false, Not(IsNull())],
  ])('free=%s filtra pelo clube no banco', async (livre, clubeId) => {
    const repositorios = criarRepositorios();
    await criarServico(repositorios).listar({ free: livre, max_age: 30 });
    expect(repositorios.jogadores.find).toHaveBeenCalledWith({ where: { excluidoEm: IsNull(), clubeId, idade: Between(16, 30) } });
  });

  it('responde 404 CLUBE_NAO_ENCONTRADO para club_id de clube inexistente, sem consultar os jogadores', async () => {
    const repositorios = criarRepositorios();
    repositorios.clubes.existsBy.mockResolvedValue(false);
    await expect(criarServico(repositorios).listar({ club_id: 99 })).rejects.toMatchObject({ codigo: 'CLUBE_NAO_ENCONTRADO', status: 404 });
    expect(repositorios.clubes.existsBy).toHaveBeenCalledWith({ id: 99 });
    expect(repositorios.jogadores.find).not.toHaveBeenCalled();
  });

  it('busca no nome sem acento e filtra pela faixa de valor de mercado, inclusiva (RN07)', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.find.mockResolvedValue([
      criarJogador(1, 'João Lua', 1500),
      criarJogador(2, 'Joana Lua', 2000),
      criarJogador(3, 'Joel Lua', 3000),
      criarJogador(4, 'Pedro Sol', 2000),
      // Valor base 2000, dentro da faixa, mas DOENTE: valor de mercado 1400, fora dela
      criarJogador(5, 'Jonas Lua', 2000, { condicao: 'DOENTE' }),
    ]);
    const pagina = await criarServico(repositorios).listar({ search: 'JO', min_value: 1500, max_value: 2000 });
    expect(pagina.itens.map((jogador) => jogador.id)).toEqual([2, 1]);
    expect(pagina).toMatchObject({ pagina: 1, limite: 10, totalDeItens: 2, totalDePaginas: 1 });
  });

  it('ordena por nome por padrão e pagina depois de ordenar', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.find.mockResolvedValue([criarJogador(1, 'Carlos Lima', 1000), criarJogador(2, 'Ana Lima', 1000), criarJogador(3, 'Bia Lima', 1000)]);
    const pagina = await criarServico(repositorios).listar({ page: 2, limit: 2 });
    expect(pagina.itens.map((jogador) => jogador.id)).toEqual([1]);
    expect(pagina).toMatchObject({ pagina: 2, limite: 2, totalDeItens: 3, totalDePaginas: 2 });
  });

  it('ordena pelo valor de mercado, e não pelo valor base (RN07.1)', async () => {
    const repositorios = criarRepositorios();
    repositorios.jogadores.find.mockResolvedValue([criarJogador(1, 'Base Alta', 5000, { condicao: 'DOENTE' }), criarJogador(2, 'Base Baixa', 4000)]);
    const pagina = await criarServico(repositorios).listar({ sort: ['value_desc'] });
    expect(pagina.itens.map((jogador) => jogador.id)).toEqual([2, 1]);
  });
});
