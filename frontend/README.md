# Frontend: interface do Passe

Interface em React 19 com TypeScript e Vite. Como instalar, executar e configurar as variáveis está no [README da raiz](../README.md); aqui ficam os detalhes do frontend.

- Interface: `http://localhost:5173`
- API usada: a origem em `VITE_API_URL` (`http://localhost:3000`); o `/api/v1` é acrescentado pelo cliente HTTP

## Telas

| Caminho          | Tela                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/`              | Tela inicial, com os números da liga                                                                                                |
| `/jogadores`     | Jogadores: abas Todos, Livres e Em clubes, busca, filtros, ordenação, paginação, cadastro, edição, condição, exclusão e compra      |
| `/clubes`        | Clubes: lista e criação                                                                                                             |
| `/clubes/{id}`   | Clube: caixa, valor do elenco e patrimônio, com as abas Elenco (venda), Escalação (com o campo) e Histórico (filtros, totais e CSV) |
| `/partidas`      | Partidas: nova partida e lista com filtro por clube                                                                                 |
| `/partidas/{id}` | Partida: placar, titulares em campo e os 6 duelos                                                                                   |
| `/classificacao` | Classificação                                                                                                                       |

Toda lista mostra carregando, erro (com "Tentar de novo") e vazio. Um endereço inexistente, ou um clube ou partida que não existe, mostra a página de não encontrado com o caminho de volta.

## Scripts

Na pasta `frontend/`, depois do `npm ci`:

| Comando                | O que faz                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento em `http://localhost:5173`                                |
| `npm run build`        | Checagem de tipos e versão de produção (usada pela imagem Docker, servida pelo nginx) |
| `npm test`             | Testes (Vitest e Testing Library), uma vez, sem modo de observação                    |
| `npm run lint:check`   | Lint (oxlint)                                                                         |
| `npm run format:check` | Confere a formatação (oxfmt), sem alterar arquivos                                    |
| `npm run verificar`    | Lint, formatação, checagem de tipos e testes, em sequência                            |

## Estrutura de pastas

```text
frontend/src/
├── rotas/                # uma tela por arquivo (TanStack Router)
├── api/                  # chamadas à API, tipos das respostas e consultas do TanStack Query
├── componentes/
│   ├── jogadores/        # tabela, filtros, modais (novo, editar, condição, excluir, comprar)
│   ├── clubes/           # tabelas, venda, escalação com o campo, histórico
│   ├── partidas/         # nova partida, placar, campo da partida, duelos, classificação
│   ├── formulario/       # campo com erro junto, casca comum dos modais, confirmação
│   ├── tabela/           # tabela com os estados de carregando, erro e vazio, e paginação
│   ├── layout/           # menu lateral (gaveta no celular), cabeçalho com a trilha, rodapé da liga
│   └── ui/               # componentes do shadcn/ui
├── hooks/                # envio de formulário com aviso de sucesso e erro; siglas dos clubes
├── lib/                  # cliente HTTP, React Query, mensagens de erro, formatação, paginação, roteador
└── testes/               # configuração dos testes e API simulada (msw)
```

As regras de cada tela (montar os filtros, validar o formulário, descrever a venda, montar a escalação) ficam em arquivos `.ts` ao lado dos componentes, em funções puras, e os testes ficam numa pasta `tests/` ao lado do código.

## Como a tela conversa com a API

- Valores calculados (valor de mercado, taxa, multa, comissão, caixa, placar e classificação) vêm prontos da API; a tela só formata, com vírgula decimal e horário de Brasília.
- Toda recusa da API aparece com o `message` que ela devolveu, junto ao formulário ou na tela.
- Um envio que falhou não é repetido sozinho, para não duplicar uma compra ou uma venda. Uma consulta é repetida uma vez só quando não houve resposta ou a API respondeu 5xx.
- A tela confere antes de enviar só o que não depende de outros dados: obrigatórios e limites de cada campo. Regras que cruzam dados (como a soma dos atributos ou o caixa do clube) ficam com a API.
- Depois de cada ação, as listas afetadas são recarregadas.

## Testes

`npm test` roda 167 testes: as funções puras de cada tela (filtros, faixas, formulários, escalação, venda, titulares da partida, formatação, paginação, erros) e testes de componente com a API simulada pelo msw (cadastro de jogador, histórico com CSV, tabela com os estados e a navegação entre telas).
