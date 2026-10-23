# Backend: API do Passe

API REST em NestJS com TypeScript, TypeORM e PostgreSQL 16. Como instalar, executar, recriar o banco e configurar as variáveis está no [README da raiz](../README.md); aqui ficam os detalhes do backend.

- Origem da API: `http://localhost:3000`; todas as rotas do enunciado ficam em `/api/v1`
- Swagger: `http://localhost:3000/api-docs`
- Healthcheck: `GET http://localhost:3000/health` (fora do `/api/v1`, usado pelo Docker)

## Rotas

| Método | Rota                                     | O que faz                                                                 |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| POST   | `/api/v1/players`                        | Cadastra um jogador; a API calcula overall, valor base e valor de mercado |
| GET    | `/api/v1/players`                        | Lista com busca, filtros, ordenação e paginação                           |
| GET    | `/api/v1/players/{id}`                   | Consulta um jogador                                                       |
| PUT    | `/api/v1/players/{id}`                   | Edita nome, posição, idade e agilidade                                    |
| PATCH  | `/api/v1/players/{id}/condition`         | Muda a condição (APTO, MAL_CONDICIONADO, DOENTE)                          |
| DELETE | `/api/v1/players/{id}`                   | Exclui um jogador livre                                                   |
| POST   | `/api/v1/clubs`                          | Cria um clube                                                             |
| GET    | `/api/v1/clubs`                          | Lista os clubes com caixa, valor do elenco e patrimônio                   |
| GET    | `/api/v1/clubs/{id}`                     | Consulta um clube com o elenco                                            |
| POST   | `/api/v1/players/{id}/buy`               | Compra um jogador livre, com contrato de fidelidade                       |
| POST   | `/api/v1/players/{id}/sell`              | Vende um jogador do clube, com multa e comissão quando houver             |
| GET    | `/api/v1/clubs/{id}/transactions`        | Histórico de compras e vendas, com os totais                              |
| GET    | `/api/v1/clubs/{id}/transactions/export` | O mesmo histórico em CSV                                                  |
| PUT    | `/api/v1/clubs/{id}/lineup`              | Salva a escalação (formação e 5 titulares)                                |
| GET    | `/api/v1/clubs/{id}/lineup`              | Consulta a escalação                                                      |
| POST   | `/api/v1/matches`                        | Joga uma partida entre dois clubes (6 duelos)                             |
| GET    | `/api/v1/matches`                        | Lista as partidas                                                         |
| GET    | `/api/v1/matches/{id}`                   | Consulta uma partida com os duelos                                        |
| GET    | `/api/v1/standings`                      | Classificação                                                             |

## Scripts

Na pasta `backend/`, depois do `npm ci`:

| Comando                                | O que faz                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run migrate`                      | Aplica as migrations (dbmate), esperando o banco aceitar conexões                                |
| `npm run recriar-banco`                | Apaga o banco com `DROP DATABASE … WITH (FORCE)` e aplica as migrations de novo, com a API no ar |
| `npm run build` e `npm run start:prod` | Compila e sobe a API                                                                             |
| `npm run start:dev`                    | Sobe a API em modo de desenvolvimento, recompilando a cada alteração                             |
| `npm test`                             | Testes unitários (Vitest), uma vez, sem modo de observação                                       |
| `npm run lint:check`                   | Lint (oxlint com regras que usam os tipos)                                                       |
| `npm run format:check`                 | Confere a formatação (oxfmt), sem alterar arquivos                                               |
| `npm run verificar`                    | Lint, formatação, checagem de tipos e testes, em sequência                                       |

## Banco de dados

Sete migrations em SQL puro, em `db/migrations/`, na ordem das chaves estrangeiras: clubes, jogadores, contratos, transações, escalações, partidas e duelos da partida. Valores em dinheiro ficam em `NUMERIC` no banco e viram centavos inteiros no código (`core/banco/transformador-centavos.ts`).

## Estrutura de pastas

```text
backend/
├── db/migrations/            # migrations SQL (dbmate)
└── src/
    ├── main.ts               # sobe a API e mostra o banner com os endereços
    ├── configurar-app.ts     # prefixo /api/v1, CORS, validação e Swagger
    ├── core/
    │   ├── banco/            # configuração do TypeORM e conversão de centavos
    │   ├── comum/            # arredondamento, moeda, data e hora de Brasília, texto, relógio, banner
    │   ├── config/           # leitura e validação das variáveis de ambiente
    │   ├── erros/            # filtro global de erro, erro de validação, 404 e regra de negócio (409)
    │   ├── http/             # log de cada requisição, corpo JSON, id da URL (fora do formato → 404)
    │   └── validacao/        # validadores reaproveitados pelos DTOs e nomes dos campos em português
    └── modulos/
        ├── jogadores/        # cadastro, edição, condição, listagem e cálculos do jogador
        ├── clubes/           # clubes, caixa, valor do elenco e patrimônio
        ├── mercado/          # compra, venda, contratos, transações, histórico e CSV
        ├── liga/             # escalação, partidas, duelos e classificação
        └── saude/            # GET /health
```

Cada módulo tem `controllers/` (rotas), `services/` (regras, transações e acesso ao banco), `dto/` (entrada validada e formato da resposta), `entities/` (tabelas) e `helpers/` (cálculos em funções puras, como valor de mercado, taxa, multa, comissão e classificação).

## Testes

`npm test` roda 530 testes unitários, sem banco: os cálculos de cada `helpers/` (com os exemplos do enunciado), os validadores e DTOs, os services com dependências simuladas e o filtro de erro. O valor de mercado (RN02 a RN05) está em `src/modulos/jogadores/helpers/tests/valor-de-mercado.spec.ts`.

## Erros

Toda recusa responde com um corpo JSON com `message` em texto, em português e com o nome do campo em português ("Potencial deve ser…"): 400 para dado inválido, 404 para recurso inexistente ou id fora do formato, 409 para regra de negócio. As decisões que o enunciado não definiu estão no [README da raiz](../README.md#decisões-e-premissas).
