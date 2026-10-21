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

## Testes, lint e formatação

Os comandos rodam depois do `npm ci` do passo "Instalar e executar" e não precisam do banco nem da API no ar. Todos terminam sozinhos (sem modo de observação), e o de formatação só verifica, sem alterar arquivos.

Backend, a partir da raiz do repositório:

```bash
cd backend
npm test
npm run lint:check
npm run format:check
```

Frontend, a partir da raiz do repositório:

```bash
cd frontend
npm test
npm run lint:check
npm run format:check
```

- Backend: testes unitários com Vitest, entre eles os do cálculo do valor de mercado (`backend/src/modulos/jogadores/helpers/tests/valor-de-mercado.spec.ts`).
- Frontend: testes de componente com Vitest e Testing Library, com a API simulada pelo msw, nas pastas `tests/` ao lado do código.
- Em cada pasta, `npm run verificar` roda os três comandos acima e também a checagem de tipos (`tsc`).

## Documentação da API e logs

- Swagger: `http://localhost:3000/api-docs`, com a API no ar (pelo `npm run start:prod` ou pelo Docker).
- Logs: cada requisição gera uma linha no terminal da API, com data e hora, método, caminho, status e duração, pelo `Logger` do NestJS. No modo Docker, as linhas aparecem em `docker compose logs -f api`.

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

```text
.
├── docker-compose.yml        # banco, migrations, API e interface (modo Docker)
├── backend/                  # API REST (NestJS)
│   ├── db/migrations/        # migrations SQL versionadas (dbmate)
│   └── src/
│       ├── main.ts, configurar-app.ts   # inicialização: prefixo /api/v1, CORS, Swagger, validação
│       ├── core/             # código comum a todos os módulos
│       │   ├── banco/        # configuração do TypeORM, conversão de centavos
│       │   ├── comum/        # arredondamento, moeda, data e hora, texto
│       │   ├── config/       # leitura e validação das variáveis de ambiente
│       │   ├── erros/        # filtro global de erro (corpo com message)
│       │   ├── http/         # log das requisições, corpo JSON, id da URL
│       │   └── validacao/    # validadores reaproveitados pelos DTOs
│       └── modulos/          # um módulo por área do enunciado
│           ├── jogadores/    # cadastro, listagem e valor de mercado
│           ├── clubes/       # clubes, caixa, patrimônio e escalação
│           ├── mercado/      # compra, venda, histórico e CSV
│           ├── liga/         # partidas e classificação
│           └── saude/        # GET /health, usado pelo healthcheck do Docker
│               (cada módulo: controllers/, services/, dto/, entities/, helpers/ com os cálculos)
└── frontend/                 # interface (React + Vite)
    └── src/
        ├── rotas/            # uma tela por arquivo (TanStack Router)
        ├── componentes/      # componentes por área (jogadores, clubes, partidas), tabela, formulário, layout e ui (shadcn/ui)
        ├── api/              # chamadas à API e tipos das respostas
        ├── hooks/            # hooks reaproveitados
        ├── lib/              # cliente HTTP, formatação de moeda e data, mensagens de erro
        └── testes/           # configuração dos testes e servidor simulado (msw)
```

Os testes ficam junto do código: no backend, em arquivos `.spec.ts` (ou numa pasta `tests/` dentro de `helpers/`); no frontend, numa pasta `tests/` ao lado do que testam.

Stack: Node.js 22, TypeScript, NestJS 11 com TypeORM e PostgreSQL 16 no backend; React 19 com Vite no frontend.

Bibliotecas do backend (`backend/package.json`):

| Biblioteca | Motivo |
|---|---|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `express`, `reflect-metadata`, `rxjs` | Núcleo do NestJS e as dependências que ele exige |
| `@nestjs/config` | Lê o `.env` e entrega as variáveis já validadas aos módulos |
| `@nestjs/typeorm`, `typeorm`, `pg` | Acesso ao PostgreSQL: entidades, repositórios, transações e o driver do banco |
| `class-validator`, `class-transformer` | Validação dos corpos e das consultas pelos DTOs (400 com `message`) |
| `@nestjs/swagger` | Documentação interativa da API em `/api-docs` |
| `@nestjs/terminus` | Rota `GET /health`, que confere o banco, para o healthcheck do Docker |
| `dbmate` | Migrations em SQL puro, com `up`, `down` e recriação do banco |
| `vitest`, `unplugin-swc`, `@nestjs/testing` | Testes unitários; o SWC compila os decorators do NestJS para o Vitest |
| `oxlint`, `oxlint-tsgolint`, `oxfmt` | Lint (com regras que usam os tipos do TypeScript) e formatação |
| `@nestjs/cli`, `@nestjs/schematics`, `@swc/cli`, `@swc/core`, `chokidar` | Build e modo de desenvolvimento do NestJS, compilando com SWC |
| `typescript`, `@types/node`, `@types/express` | Compilador e tipos |

Bibliotecas do frontend (`frontend/package.json`):

| Biblioteca | Motivo |
|---|---|
| `react`, `react-dom`, `vite`, `@vitejs/plugin-react` | Base da interface e servidor de desenvolvimento e build |
| `@tanstack/react-router`, `@tanstack/router-plugin` | Rotas com tipos, geradas a partir dos arquivos de `src/rotas/` |
| `@tanstack/react-query` | Busca na API com estado de carregamento e de erro, cache e recarga depois das alterações |
| `axios` | Cliente HTTP com a URL da API num só lugar e o download do CSV |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Formulários com validação junto ao campo antes de enviar à API |
| `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css` | Estilos por classes utilitárias e as animações dos componentes |
| `shadcn`, `radix-ui`, `class-variance-authority`, `cn` | Componentes acessíveis do shadcn/ui (modal, menu, abas, tabela) e a junção das classes |
| `lucide-react` | Ícones |
| `sonner`, `next-themes` | Avisos de sucesso e de erro (toasts); o `next-themes` é pedido pelo componente de aviso do shadcn/ui |
| `@fontsource-variable/inter` | Fonte Inter servida pelo próprio projeto, sem depender de serviço externo |
| `vitest`, `happy-dom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw` | Testes de componente: tela simulada, ações do usuário e API simulada |
| `oxlint`, `oxfmt` | Lint e formatação |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | Compilador e tipos |

## Decisões e premissas

Decisões sobre detalhes que o enunciado não definiu:

- **Idade:** é o número gravado e só muda pela edição; o jogador não envelhece com o tempo.
- **Espaço nos nomes:** só o caractere U+0020 conta como espaço. Antes de validar e gravar, o texto é convertido para a forma Unicode NFC, para que "Á" composto e "A" seguido do acento separado sejam o mesmo nome.
- **Nome do clube:** todo pedaço entre espaços precisa ser uma palavra com pelo menos uma letra (`Águias - FC` é recusado). A sigla começa pela primeira **letra** do nome, comparada sem acento e sem diferenciar maiúsculas.
- **Nome do jogador:** um pedaço sem letra (como `-` ou aspas) é aceito, mas não conta como palavra.
- **Nome único do clube:** a comparação usa uma coluna normalizada, preenchida pela aplicação, com índice único no banco.
- **Edição do jogador:** "mudar de posição" é enviar uma posição diferente da atual; reenviar a mesma é aceito. O limite de agilidade a partir de 35 anos vale também na edição (400).
- **Compra:** "depois do momento da compra" é estritamente depois, e o limite de 1.095 dias é inclusivo, comparado com o instante do servidor.
- **Pedidos sem corpo** (consultas, exclusão e venda): um corpo enviado é ignorado, mesmo malformado.
- **Rotas fora do `/api/v1`:** `GET /health` (healthcheck) e `/api-docs` (Swagger). Dentro de `/api/v1`, só as rotas do enunciado.
- **Dinheiro:** no código, os valores são inteiros em centavos, e cada resultado é arredondado uma única vez, no fim do cálculo; no banco, ficam em `NUMERIC`.
- **Listagens com valores calculados** (valor de mercado, patrimônio, classificação): o banco aplica os filtros simples, e a busca, a ordenação e a paginação são feitas na aplicação, para seguir a ordem alfabética exata do enunciado.
- **Concorrência:** compra, venda, escalação e partida travam as linhas com `SELECT … FOR UPDATE`, sempre na mesma ordem (jogadores e depois clubes, por id), para não haver deadlock. A criação de clube usa um bloqueio próprio, para que o limite de 20 clubes não seja ultrapassado por dois pedidos ao mesmo tempo.
- **Nomes no código:** os identificadores estão em português, sem acento. Ficam em inglês só os nomes impostos pelo framework ou pela API (sufixos como `Controller` e `Service`, campos em `snake_case`).
- **Telas:** os caminhos estão em português (`/jogadores`, `/clubes/1`, `/partidas`, `/classificacao`). As partidas, a página de cada partida e a classificação são telas separadas, como no mockup.
- **Filtro do histórico:** nas caixas Compra e Venda, pelo menos uma fica sempre marcada; com as duas marcadas, nenhum filtro de tipo é enviado.
- **Frontend e API:** o navegador chama a API direto pela `VITE_API_URL`, sem proxy, com o CORS liberado para a origem da interface.
- **375 px:** abaixo de 768 px de largura, o menu lateral abre por cima da página pelo botão do cabeçalho, e as tabelas e as abas rolam no próprio quadro.

## Funcionalidades não implementadas

Todas as funcionalidades foram implementadas.

## Uso de inteligência artificial

**Ferramenta:** Claude Code (Anthropic), no terminal. Não usei outra ferramenta de IA.

**Como:** combinei uma regra no início do projeto e a segui até o fim.

- A IA não criava nem editava arquivos deste repositório e não rodava comandos que gerassem código nele. A cada passo, ela propunha o comando ou o conteúdo; eu digitava, executava, conferia o resultado e fazia o commit.
- Depois de cada commit, a IA revisava o que eu tinha feito: lia os arquivos e rodava lint, formatação, checagem de tipos, testes e build numa cópia fora do repositório. Quando encontrava um problema, apontava, e eu corrigia.
- Fora do repositório (não faz parte da entrega), a IA manteve a documentação de trabalho: requisitos e regras tirados do enunciado e do barema, decisões, backlog de tarefas e estado atual. Essa documentação guardava o contexto entre uma sessão e outra.

**Onde:** em todo o projeto, sempre por esse fluxo.

- Backend: estrutura dos módulos, DTOs e validações, funções de cálculo (valor de mercado, taxas, multa, comissão, classificação) e os testes delas, transações e bloqueios, migrations, Docker e Swagger.
- Frontend: telas, componentes, formulários, chamadas à API, testes de componente e adaptação para 375 px.

**Por quê:** para ganhar velocidade num prazo curto sem perder o controle do código. Digitar e executar cada passo me obrigava a entender o que estava entrando, e a revisão depois de cada commit pegava os erros cedo.

**Skills que criei para o projeto** (comandos do Claude Code, guardados fora do repositório):

- `/recuperar` e `/sincronizar`: o primeiro retoma o contexto a partir da documentação no início de cada sessão; o segundo grava decisões, dúvidas e o status das tarefas antes de a conversa ser compactada. Assim, nada dependia da memória do chat.
- `/auditoria` e `/revisao-backend`: revisões somente leitura que comparam o código com o enunciado, o barema e as decisões registradas, executam os testes e listam os achados por gravidade. Um achado só virava tarefa depois da minha confirmação.

**O que aceitei, alterei ou descartei:**

- Aceitei a maior parte das propostas, depois de entender e executar cada passo.
- Alterei a organização dos testes: a proposta deixava cada teste ao lado do arquivo testado. Passei a guardá-los numa pasta `tests/`: no backend, dentro de `dto/` e `helpers/`; no frontend, em cada pasta, ao lado do código.
- Descartei manter o React 18. Os componentes atuais do shadcn/ui esperam o React 19, e no 18 cada componente que recebe `ref` precisaria ser reescrito com `forwardRef`. Mudei para o React 19.
- Na adaptação para 375 px, troquei por conta própria algumas classes `flex` por `flex-wrap`. A revisão mostrou que isso desfazia o alinhamento em linha, e corrigi para `flex flex-wrap`.
