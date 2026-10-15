-- migrate:up

CREATE TYPE posicao_jogador AS ENUM ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA');
CREATE TYPE condicao_jogador AS ENUM ('APTO', 'MAL_CONDICIONADO', 'DOENTE');

COMMENT ON TYPE posicao_jogador IS 'Posição do jogador. Ordem do elenco: GOL, ZAG, LAT, MEI, ATA (RN11).';
COMMENT ON TYPE condicao_jogador IS 'Condição física do jogador (RN02).';

CREATE TABLE jogadores (
  id            SERIAL           PRIMARY KEY,
  nome          VARCHAR(100)     NOT NULL,
  posicao       posicao_jogador  NOT NULL,
  agilidade     INTEGER          NOT NULL,
  idade         INTEGER          NOT NULL,
  valor_base    NUMERIC(6,2)     NOT NULL,
  condicao      condicao_jogador NOT NULL DEFAULT 'APTO',
  clube_id      INTEGER          NULL,
  velocidade    INTEGER          NOT NULL,
  finalizacao   INTEGER          NOT NULL,
  passe         INTEGER          NOT NULL,
  drible        INTEGER          NOT NULL,
  defesa        INTEGER          NOT NULL,
  fisico        INTEGER          NOT NULL,
  potencial     INTEGER          NOT NULL,
  excluido_em   TIMESTAMPTZ      NULL,
  criado_em     TIMESTAMPTZ      NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ      NOT NULL DEFAULT now(),
  CONSTRAINT fk_jogadores_clube FOREIGN KEY (clube_id) REFERENCES clubes (id) ON DELETE RESTRICT
);

CREATE INDEX idx_jogadores_clube_id ON jogadores (clube_id);

COMMENT ON COLUMN jogadores.id IS 'Identificador do jogador (PK).';
COMMENT ON COLUMN jogadores.nome IS 'Nome normalizado pela V4 (NFC, sem espaços repetidos), 3 a 100 caracteres. Homônimos são permitidos.';
COMMENT ON COLUMN jogadores.posicao IS 'Posição atual; muda no PUT só se o jogador estiver livre (RN08).';
COMMENT ON COLUMN jogadores.agilidade IS 'Agilidade de 1 a 100; no máximo 85 com 35 anos ou mais. Validada no DTO.';
COMMENT ON COLUMN jogadores.idade IS 'Idade atual, de 16 a 45; não diminui no PUT (RN08).';
COMMENT ON COLUMN jogadores.valor_base IS 'Valor base calculado no cadastro (RN06); nunca recalculado.';
COMMENT ON COLUMN jogadores.condicao IS 'Condição física; APTO no cadastro; muda pelo PATCH de condição.';
COMMENT ON COLUMN jogadores.clube_id IS 'Clube atual. FK para clubes(id). NULL = jogador livre. Muda só por compra e venda.';
COMMENT ON COLUMN jogadores.velocidade IS 'Atributo pace, 1 a 99, informado no cadastro; não muda.';
COMMENT ON COLUMN jogadores.finalizacao IS 'Atributo shooting, 1 a 99, informado no cadastro; não muda.';
COMMENT ON COLUMN jogadores.passe IS 'Atributo passing, 1 a 99, informado no cadastro; não muda.';
COMMENT ON COLUMN jogadores.drible IS 'Atributo dribbling, 1 a 99, informado no cadastro; não muda.';
COMMENT ON COLUMN jogadores.defesa IS 'Atributo defending, 1 a 99, informado no cadastro; não muda.';
COMMENT ON COLUMN jogadores.fisico IS 'Atributo physical, 1 a 99, informado no cadastro; não muda.';
COMMENT ON COLUMN jogadores.potencial IS 'Potencial, 1 a 99, maior ou igual ao maior atributo; não muda (RN06).';
COMMENT ON COLUMN jogadores.excluido_em IS 'Momento da exclusão lógica (RN09). NULL indica jogador ativo.';
COMMENT ON COLUMN jogadores.criado_em IS 'Data e hora do cadastro.';
COMMENT ON COLUMN jogadores.atualizado_em IS 'Data e hora da última alteração.';

-- migrate:down

DROP TABLE IF EXISTS jogadores;
DROP TYPE IF EXISTS condicao_jogador;
DROP TYPE IF EXISTS posicao_jogador;
