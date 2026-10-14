import { QueryFailedError } from 'typeorm';
import { SqlState, temSqlState } from '@/core/banco/sql-state';

function erroDoBanco(code: string): QueryFailedError {
  return new QueryFailedError('INSERT INTO clubes ...', [], Object.assign(new Error('duplicate key'), { code }));
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
