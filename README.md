# Passe: mercado de jogadores

Estudo de caso SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK).

## Pré-requisitos

- Ubuntu 24.04 (amd64)
- Node.js 22 LTS, com o npm que o acompanha
- Docker Engine com Docker Compose v2, utilizável sem `sudo`
- Git

Instalados pelos próprios comandos abaixo, sem instalação manual:

- PostgreSQL 16 (imagem `postgres:16-alpine`, pelo Docker Compose)
- dbmate 2.36.0, para as migrations (pelo `npm ci` do backend; no Docker, imagem `amacneil/dbmate:2.36.0`)

As portas 3000 (API), 5173 (interface) e 5435 (banco) precisam estar livres.

## Instalar e executar

Terminal 1, a partir da raiz do repositório (banco e backend):

```bash
docker compose up -d --wait db
cd backend
cp .env.example .env
npm ci
npm run migrate
npm run build
npm run start:prod
```

A API fica em `http://localhost:3000` (o script da banca acrescenta `/api/v1`). O comando `npm run start:prod` continua rodando.

Terminal 2, a partir da raiz do repositório (frontend):

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

A interface fica em `http://localhost:5173`.

## Banco de dados: criar e recriar do zero

O banco é criado no passo anterior: `docker compose up -d --wait db` sobe o PostgreSQL e `npm run migrate` cria as tabelas pelas migrations versionadas em `backend/db/migrations/`. Ele começa vazio, sem jogadores, clubes, transações nem partidas. Não há carga de dados de exemplo.

Para recriar do zero (apagar e criar de novo), num terminal novo a partir da raiz do repositório, com a API rodando:

```bash
cd backend
npm run recriar-banco
```

A API não precisa ser reiniciada.

## Docker: tudo com um comando

Com os processos dos passos anteriores parados, na raiz do repositório:

```bash
docker compose up -d --build --wait
```

O comando sobe o banco, aplica as migrations e sobe a API (`http://localhost:3000`) e a interface (`http://localhost:5173`). Nesse modo, as variáveis estão no próprio `docker-compose.yml` e nenhum `.env` é usado.

- Recriar o banco do zero: `docker compose down -v` e depois `docker compose up -d --build --wait`
- Parar tudo: `docker compose down`

## Variáveis de ambiente

Os valores do `.env.example` funcionam sem alteração.

`backend/.env`:

| Variável | Exemplo | Uso |
|---|---|---|
| `APP_PORT` | `3000` | Porta da API |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem da interface liberada no CORS |
| `DATABASE_HOST`, `DATABASE_PORT` | `localhost`, `5435` | Endereço do PostgreSQL |
| `DATABASE_USER`, `DATABASE_PASSWORD` | `postgres`, `postgres` | Usuário e senha do banco local (só desenvolvimento) |
| `DATABASE_NAME` | `passe` | Nome do banco |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5435/passe?sslmode=disable` | Conexão usada pelo dbmate nas migrations |
| `DBMATE_NO_DUMP_SCHEMA` | `true` | Impede o dbmate de gerar um `schema.sql` a cada migration |

`frontend/.env`:

| Variável | Exemplo | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Origem da API, sem `/api/v1` |

## Estrutura de pastas e bibliotecas

A preencher.

## Decisões e premissas

A preencher.

## Funcionalidades não implementadas

A preencher.

## Uso de inteligência artificial

A preencher.
