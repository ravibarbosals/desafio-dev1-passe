-- migrate:up

CREATE TABLE clubes (
  id               SERIAL        PRIMARY KEY,
  nome             VARCHAR(60)   NOT NULL,
  nome_normalizado VARCHAR(120)  NOT NULL,
  sigla            CHAR(3)       NOT NULL,
  caixa            NUMERIC(10,2) NOT NULL DEFAULT 300.00,
  formacao         VARCHAR(5)    NULL,
  criado_em        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_clubes_nome_normalizado ON clubes (nome_normalizado);
CREATE UNIQUE INDEX uq_clubes_sigla ON clubes (sigla);

COMMENT ON COLUMN clubes.id IS 'Identificador do clube (PK).';
COMMENT ON COLUMN clubes.nome IS 'Nome normalizado pela V4, 3 a 60 caracteres, 2 a 5 palavras; só letras, espaço, hífen e ponto.';
COMMENT ON COLUMN clubes.nome_normalizado IS 'Nome depois da V4, em NFC e minúsculas, com acentos (PR-007, PR-010). Preenchido pela aplicação; garante a unicidade da RN10 no banco. 120 porque minúsculas podem ter mais pontos de código que o original.';
COMMENT ON COLUMN clubes.sigla IS 'Três letras A-Z tiradas do nome, na ordem, começando pela primeira letra (Limites). Única.';
COMMENT ON COLUMN clubes.caixa IS 'Caixa (verba de transferências). 300.00 na criação; muda só por compra e venda.';
COMMENT ON COLUMN clubes.formacao IS 'Formação da escalação (3-1, 2-2, 2-1-1 ou 1-2-1). NULL enquanto o clube não escalou (RN19).';
COMMENT ON COLUMN clubes.criado_em IS 'Data e hora da criação.';

-- migrate:down

DROP TABLE IF EXISTS clubes;