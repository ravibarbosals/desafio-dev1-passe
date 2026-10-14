import { IsOptional } from 'class-validator';
import { BooleanoDeQuery, DecimalDeQuery, InteiroDeQuery, ListaDeQuery, ValorDeQuery } from '@/core/validacao/query/query.decorators';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';

const ordenacoes = ['name', 'value_asc', 'value_desc', 'age_asc', 'age_desc', 'position'] as const;

class QueryDeTeste {
  @IsOptional()
  @InteiroDeQuery(16, 45)
  min_age?: number;

  @IsOptional()
  @InteiroDeQuery(1)
  club_id?: number;

  @IsOptional()
  @DecimalDeQuery(0, 550)
  min_value?: number;

  @IsOptional()
  @BooleanoDeQuery()
  free?: boolean;

  @IsOptional()
  @ValorDeQuery(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'])
  position?: string;

  @IsOptional()
  @ListaDeQuery(ordenacoes, { maximo: 2, campo: (valor) => valor.replace(/_(asc|desc)$/, '') })
  sort?: string[];

  @IsOptional()
  @ListaDeQuery(['COMPRA', 'VENDA'])
  type?: string[];
}

function validar(query: object): Promise<QueryDeTeste> {
  return criarValidationPipe().transform(query, { type: 'query', metatype: QueryDeTeste }) as Promise<QueryDeTeste>;
}

describe('decorators de query', () => {
  it('converte os valores válidos', async () => {
    const query = await validar({ min_age: '16', club_id: '2147483647', min_value: '10.5', free: 'false', position: 'MEI', sort: 'value_desc,name', type: 'VENDA,COMPRA' });

    expect(query).toEqual({ min_age: 16, club_id: 2147483647, min_value: 1050, free: false, position: 'MEI', sort: ['value_desc', 'name'], type: ['VENDA', 'COMPRA'] });
  });

  it('parâmetro ausente não filtra', async () => {
    await expect(validar({})).resolves.toEqual({});
  });

  it('ignora parâmetro fora da tabela', async () => {
    await expect(validar({ outro: 'x' })).resolves.toEqual({});
  });

  it.each([
    ['min_age', ''],
    ['min_age', '15'],
    ['min_age', '46'],
    ['min_age', '016'],
    ['min_age', '+20'],
    ['min_age', '20.0'],
    ['min_age', '2e1'],
    ['min_age', ['20', '21']],
    ['club_id', '0'],
    ['club_id', '-1'],
    ['club_id', '2147483648'],
    ['min_value', ''],
    ['min_value', '550.01'],
    ['min_value', '10.555'],
    ['min_value', '010'],
    ['min_value', '.5'],
    ['min_value', '10,5'],
    ['min_value', '-1'],
    ['free', 'TRUE'],
    ['free', ''],
    ['position', 'mei'],
    ['position', ''],
    ['sort', 'POSITION'],
    ['sort', 'value_asc,value_desc'],
    ['sort', 'name,age_asc,position'],
    ['sort', 'name, position'],
    ['sort', 'name,'],
    ['sort', ''],
    ['type', 'COMPRA,venda'],
    ['type', 'COMPRA,COMPRA'],
    ['sort', ['name', 'position']],
    ['type', ['COMPRA', 'VENDA']],
  ])('recusa %s=%j com 400', async (parametro, valor) => {
    await expect(validar({ [parametro]: valor })).rejects.toMatchObject({ codigo: 'DADOS_INVALIDOS', status: 400 });
  });

  it.each([
    ['min_value', '0.5', 50],
    ['min_value', '0', 0],
    ['min_value', '550', 55000],
  ])('aceita %s=%s', async (parametro, valor, esperado) => {
    await expect(validar({ [parametro]: valor })).resolves.toEqual({ [parametro]: esperado });
  });

  it('explica o formato na mensagem', async () => {
    await expect(validar({ min_age: '15' })).rejects.toThrow('Dados inválidos: min_age deve ser um inteiro de 16 a 45.');
    await expect(validar({ club_id: '0' })).rejects.toThrow('Dados inválidos: club_id deve ser um inteiro de 1 ou mais.');
  });
});
