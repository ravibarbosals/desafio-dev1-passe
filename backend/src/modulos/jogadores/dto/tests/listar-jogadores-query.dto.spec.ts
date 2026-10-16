import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { ListarJogadoresQueryDto } from '@/modulos/jogadores/dto/lista-jogadores-query.dto';

function validar(query: object): Promise<ListarJogadoresQueryDto> {
  return criarValidationPipe().transform(query, { type: 'query', metatype: ListarJogadoresQueryDto }) as Promise<ListarJogadoresQueryDto>;
}

describe('ListarJogadoresQueryDto', () => {
  it('converte a query completa', async () => {
    const query = {
      search: '  Meia   Lua ',
      position: 'MEI',
      condition: 'APTO',
      free: 'false',
      club_id: '1',
      min_age: '20',
      max_age: '30',
      min_value: '10.5',
      max_value: '40',
      sort: 'position,value_desc',
      page: '2',
      limit: '50',
    };
    await expect(validar(query)).resolves.toEqual({
      search: 'Meia Lua',
      position: 'MEI',
      condition: 'APTO',
      free: false,
      club_id: 1,
      min_age: 20,
      max_age: 30,
      min_value: 1050,
      max_value: 4000,
      sort: ['position', 'value_desc'],
      page: 2,
      limit: 50,
    });
  });

  it('aceita a query vazia (sem filtros e com os padrões no service)', async () => {
    await expect(validar({})).resolves.toEqual({});
  });

  it.each([
    ['free=true com club_id', { free: 'true', club_id: '1' }],
    ['min_age maior que max_age', { min_age: '30', max_age: '20' }],
    ['min_value maior que max_value', { min_value: '50', max_value: '40' }],
    ['min_value com 3 casas', { min_value: '10.555' }],
    ['min_value acima de 550', { min_value: '551' }],
    ['min_value com zero à esquerda', { min_value: '010' }],
    ['sort em maiúsculas', { sort: 'POSITION' }],
    ['sort repetindo o campo', { sort: 'value_asc,value_desc' }],
    ['sort com 3 critérios', { sort: 'name,age_asc,position' }],
    ['position em minúsculas', { position: 'mei' }],
    ['condition fora da lista', { condition: 'LESIONADO' }],
    ['search vazio', { search: '' }],
    ['search só com espaços', { search: '   ' }],
    ['search com 1 caractere', { search: 'a' }],
    ['search com 101 caracteres', { search: 'a'.repeat(101) }],
    ['page 0', { page: '0' }],
    ['limit 51', { limit: '51' }],
    ['limit 0', { limit: '0' }],
    ['min_age 15', { min_age: '15' }],
    ['club_id 0', { club_id: '0' }],
  ])('recusa %s com 400', async (_caso, query) => {
    await expect(validar(query)).rejects.toMatchObject({ codigo: 'DADOS_INVALIDOS', status: 400 });
  });

  it.each([
    ['free=false com club_id', { free: 'false', club_id: '1' }],
    ['só max_age', { max_age: '20' }],
    ['min_value 0.5', { min_value: '0.5' }],
    ['search com 2 caracteres', { search: 'jo' }],
    ['limit 1', { limit: '1' }],
  ])('aceita %s', async (_caso, query) => {
    await expect(validar(query)).resolves.toBeInstanceOf(ListarJogadoresQueryDto);
  });

  it('ignora parâmetro fora da tabela', async () => {
    await expect(validar({ outro: 'x' })).resolves.toEqual({});
  });
});