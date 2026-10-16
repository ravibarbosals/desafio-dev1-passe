import { QueryFailedError } from 'typeorm';
import { SqlState, temSqlState, restricaoViolada } from '@/core/banco/sql-state';

function erroDoBanco(code: string, constraint?: string): QueryFailedError {
  return new QueryFailedError('INSERT INTO clubes ...', [], Object.assign(new Error('duplicate key'), { code, constraint }));
}

describe('temSqlState', () => {
  it('reconhece a violação de unicidade do PostgreSQL', () => {
    expect(temSqlState(erroDoBanco('23505'), SqlState.ViolacaoDeUnicidade)).toBe(true);
  });

  it('recusa outro código do banco', () => {
    expect(temSqlState(erroDoBanco('23503'), SqlState.ViolacaoDeUnicidade)).toBe(false);
  });

  it('recusa erro que não veio do banco', () => {
    expect(temSqlState(Object.assign(new Error('x'), { code: '23505' }), SqlState.ViolacaoDeUnicidade)).toBe(false);
  });
});

describe('restricaoViolada', () => {
  it('devolve o nome do índice que o banco informou', () => {
    expect(restricaoViolada(erroDoBanco('23505', 'uq_clubes_sigla'))).toBe('uq_clubes_sigla');
  });

  it('devolve undefined quando o banco não informou a restrição', () => {
    expect(restricaoViolada(erroDoBanco('23505'))).toBeUndefined();
  });

  it('devolve undefined para erro que não veio do banco', () => {
    expect(restricaoViolada(Object.assign(new Error('x'), { constraint: 'uq_clubes_sigla' }))).toBeUndefined();
  });
});
