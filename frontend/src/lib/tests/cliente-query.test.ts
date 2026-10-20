import { AxiosError, AxiosHeaders } from "axios";

import { criarClienteQuery, deveRepetirConsulta } from "../cliente-query";

function erroComStatus(status: number) {
  return new AxiosError("falhou", "ERR_BAD_RESPONSE", undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: {},
  });
}

describe("criarClienteQuery", () => {
  it("não repete mutation que falhou (DEC-007)", () => {
    expect(criarClienteQuery().getDefaultOptions().mutations?.retry).toBe(0);
  });
});

describe("deveRepetirConsulta", () => {
  it("repete uma vez sem resposta (rede) ou com 5xx", () => {
    expect(deveRepetirConsulta(0, new AxiosError("Network Error", "ERR_NETWORK"))).toBe(true);
    expect(deveRepetirConsulta(0, erroComStatus(500))).toBe(true);
    expect(deveRepetirConsulta(1, erroComStatus(500))).toBe(false);
  });

  it("não repete um 4xx: a resposta da API é definitiva", () => {
    expect(deveRepetirConsulta(0, erroComStatus(404))).toBe(false);
    expect(deveRepetirConsulta(0, erroComStatus(400))).toBe(false);
  });
});
