import { IsOptional } from 'class-validator';
import { DiferenteDe, MenorOuIgualA, ProibidoJuntoCom } from '@/core/validacao/comparacao/comparacao.decorators';
import { BooleanoDeQuery, InteiroDeQuery } from '@/core/validacao/query/query.decorators';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';

class FaixaDeTeste {
  @IsOptional()
  @InteiroDeQuery(16, 45)
  @MenorOuIgualA('max_age')
  min_age?: number;

  @IsOptional()
  @InteiroDeQuery(16, 45)
  max_age?: number;

  @IsOptional()
  @BooleanoDeQuery()
  @ProibidoJuntoCom('club_id', (valor) => valor === true)
  free?: boolean;

  @IsOptional()
  @InteiroDeQuery(1)
  club_id?: number;
}

function validar(query: object): Promise<FaixaDeTeste> {
  return criarValidationPipe().transform(query, { type: 'query', metatype: FaixaDeTeste }) as Promise<FaixaDeTeste>;
}

describe('MenorOuIgualA', () => {
  it.each([{ min_age: '20', max_age: '20' }, { min_age: '20' }, { max_age: '20' }])('aceita %j', async (query) => {
    await expect(validar(query)).resolves.toBeDefined();
  });

  it('recusa faixa invertida', async () => {
    await expect(validar({ min_age: '30', max_age: '20' })).rejects.toThrow('Idade mínima não pode ser maior que idade máxima.');
  });
});

describe('ProibidoJuntoCom', () => {
  it('recusa free=true com club_id', async () => {
    await expect(validar({ free: 'true', club_id: '1' })).rejects.toThrow('Só livres não pode ser combinado com clube.');
  });

  it.each([{ free: 'false', club_id: '1' }, { free: 'true' }, { club_id: '1' }])('aceita %j', async (query) => {
    await expect(validar(query)).resolves.toBeDefined();
  });
});

class ConfrontoDeTeste {
  @IsOptional()
  home?: unknown;

  @IsOptional()
  @DiferenteDe('home')
  away?: unknown;
}

describe('DiferenteDe', () => {
  function validarConfronto(corpo: object): Promise<ConfrontoDeTeste> {
    return criarValidationPipe().transform(corpo, { type: 'body', metatype: ConfrontoDeTeste }) as Promise<ConfrontoDeTeste>;
  }

  it('recusa valores iguais', async () => {
    await expect(validarConfronto({ home: 1, away: 1 })).rejects.toThrow('away deve ser diferente de home.');
  });

  it.each([{ home: 1, away: 2 }, { away: 1 }, { home: 1 }, { home: '1', away: 1 }])('aceita %j (só compara dois números)', async (corpo) => {
    await expect(validarConfronto(corpo)).resolves.toBeDefined();
  });
});
