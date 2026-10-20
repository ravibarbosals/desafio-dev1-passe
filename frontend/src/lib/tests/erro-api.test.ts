import { http, HttpResponse } from "msw";

import { servidor } from "@/testes/servidor";

import { api } from "../api";
import {
  NaoEncontrado,
  extrairMensagemErro,
  mensagemErroPadrao,
  mensagemSemConexao,
  recusadoPelaApi,
  semResposta,
} from "../erro-api";

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

describe("ehNaoEncontrado", () => {
  it("é verdade só para o 404 da API", async () => {
    servidor.use(
      http.get("http://localhost:3000/api/v1/clubs/99", () =>
        HttpResponse.json({ message: "Clube não encontrado." }, { status: 404 }),
      ),
      http.get("http://localhost:3000/api/v1/clubs/1", () =>
        HttpResponse.json({ message: "Erro." }, { status: 500 }),
      ),
    );

    expect(NaoEncontrado(await capturarErro("/clubs/99"))).toBe(true);
    expect(NaoEncontrado(await capturarErro("/clubs/1"))).toBe(false);
    expect(NaoEncontrado(new Error("outro"))).toBe(false);
  });
});

describe("semResposta", () => {
  it("é verdade só quando o servidor não respondeu", async () => {
    servidor.use(
      http.get("http://localhost:3000/api/v1/clubs", () => HttpResponse.error()),
      http.get("http://localhost:3000/api/v1/clubs/1", () =>
        HttpResponse.json({ message: "Erro." }, { status: 409 }),
      ),
    );

    expect(semResposta(await capturarErro("/clubs"))).toBe(true);
    expect(semResposta(await capturarErro("/clubs/1"))).toBe(false);
    expect(semResposta(new Error("outro"))).toBe(false);
  });
});

describe("recusadoPelaApi", () => {
  it("é verdade só quando a API respondeu com 4xx", async () => {
    servidor.use(
      http.get("http://localhost:3000/api/v1/clubs/1", () =>
        HttpResponse.json({ message: "Jogador não encontrado." }, { status: 404 }),
      ),
      http.get("http://localhost:3000/api/v1/clubs/2", () =>
        HttpResponse.json({ message: "Erro." }, { status: 500 }),
      ),
      http.get("http://localhost:3000/api/v1/clubs", () => HttpResponse.error()),
    );

    expect(recusadoPelaApi(await capturarErro("/clubs/1"))).toBe(true);
    expect(recusadoPelaApi(await capturarErro("/clubs/2"))).toBe(false);
    expect(recusadoPelaApi(await capturarErro("/clubs"))).toBe(false);
  });
});
