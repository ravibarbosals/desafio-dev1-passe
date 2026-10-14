import { QueryFailedError } from 'typeorm';

// Códigos de erro do PostgreSQL que o código trata (lista completa: "PostgreSQL Error Codes")
export enum SqlState {
  ViolacaoDeUnicidade = '23505',
}

export function temSqlState(erro: unknown, codigo: SqlState): boolean {
  if (!(erro instanceof QueryFailedError)) {
    return false;
  }
  const erroDoDriver: unknown = erro.driverError;
  return typeof erroDoDriver === 'object' && erroDoDriver !== null && 'code' in erroDoDriver && erroDoDriver.code === codigo;
}
