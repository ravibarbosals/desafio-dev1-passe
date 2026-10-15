-- migrate:up

CREATE TABLE partidas (
  id                 SERIAL      PRIMARY KEY,
  mandante_id        INTEGER     NOT NULL,
  visitante_id       INTEGER     NOT NULL,
  gols_mandante      INTEGER     NOT NULL,
  gols_visitante     INTEGER     NOT NULL,
  formacao_mandante  VARCHAR(5)  NOT NULL,
  formacao_visitante VARCHAR(5)  NOT NULL,
  jogada_em          TIMESTAMPTZ NOT NULL,
  CONSTRAINT fk_partidas_mandante FOREIGN KEY (mandante_id) REFERENCES clubes (id) ON DELETE RESTRICT,
  CONSTRAINT fk_partidas_visitante FOREIGN KEY (visitante_id) REFERENCES clubes (id) ON DELETE RESTRICT
);

CREATE INDEX idx_partidas_mandante_id ON partidas (mandante_id);
CREATE INDEX idx_partidas_visitante_id ON partidas (visitante_id);
CREATE INDEX idx_partidas_jogada_em ON partidas (jogada_em DESC, id DESC);

COMMENT ON COLUMN partidas.id IS 'Identificador da partida (PK).';
COMMENT ON COLUMN partidas.mandante_id IS 'Clube mandante. FK para clubes(id).';
COMMENT ON COLUMN partidas.visitante_id IS 'Clube visitante. FK para clubes(id). Diferente do mandante (validado no DTO).';
COMMENT ON COLUMN partidas.gols_mandante IS 'Gols do mandante, de 0 a 3 (RN20).';
COMMENT ON COLUMN partidas.gols_visitante IS 'Gols do visitante, de 0 a 3 (RN20).';
COMMENT ON COLUMN partidas.formacao_mandante IS 'Formação do mandante no momento da partida.';
COMMENT ON COLUMN partidas.formacao_visitante IS 'Formação do visitante no momento da partida.';
COMMENT ON COLUMN partidas.jogada_em IS 'Data e hora em que a partida foi jogada.';

-- migrate:down

DROP TABLE IF EXISTS partidas;