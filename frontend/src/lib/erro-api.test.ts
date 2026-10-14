import { http, HttpResponse } from "msw";

import { servidor } from "@/testes/servidor";

import { api } from "./api";
import { extrairMensagemErro, mensagemErroPadrao, mensagemSemConexao } from "./erro-api";

async function capturarErro(caminho: string): Promise<unknown> {
  try {
    await api.get(caminho);
  } catch (erro) {
    return erro;
  }
  throw new Error("a requisição deveria falhar");
}

describe("extrairMensagemErro", () => {
  it("usa o message do corpo de erro da API", async () => {
    servidor.use(
      http.get("http://localhost:3000/api/v1/clubs/99", () =>
        HttpResponse.json(
          {
            message: "Clube não encontrado.",
            statusCode: 404,
            codigoRegra: "CLUBE_NAO_ENCONTRADO",
          },
          { status: 404 },
        ),
      ),
    );

    expect(extrairMensagemErro(await capturarErro("/clubs/99"))).toBe("Clube não encontrado.");
  });

  it("usa a mensagem padrão quando a resposta não traz message", async () => {
    servidor.use(
      http.get("http://localhost:3000/api/v1/clubs", () => new HttpResponse(null, { status: 502 })),
    );

    expect(extrairMensagemErro(await capturarErro("/clubs"))).toBe(mensagemErroPadrao);
  });

  it("avisa quando não há resposta do servidor", async () => {
    servidor.use(http.get("http://localhost:3000/api/v1/clubs", () => HttpResponse.error()));

    expect(extrairMensagemErro(await capturarErro("/clubs"))).toBe(mensagemSemConexao);
  });

  it("usa a mensagem padrão para erro que não veio da API", () => {
    expect(extrairMensagemErro(new Error("falha qualquer"))).toBe(mensagemErroPadrao);
  });
});
