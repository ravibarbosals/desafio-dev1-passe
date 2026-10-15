-- migrate:up

CREATE TABLE escalacoes (
  clube_id   INTEGER     NOT NULL,
  jogador_id INTEGER     NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_escalacoes PRIMARY KEY (clube_id, jogador_id),
  CONSTRAINT fk_escalacoes_clube FOREIGN KEY (clube_id) REFERENCES clubes (id) ON DELETE RESTRICT,
  CONSTRAINT fk_escalacoes_jogador FOREIGN KEY (jogador_id) REFERENCES jogadores (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_escalacoes_jogador_id ON escalacoes (jogador_id);

COMMENT ON COLUMN escalacoes.clube_id IS 'Clube da escalação. FK para clubes(id). Parte da PK.';
COMMENT ON COLUMN escalacoes.jogador_id IS 'Titular. FK para jogadores(id). Único: um jogador em no máximo uma escalação.';
COMMENT ON COLUMN escalacoes.criado_em IS 'Momento em que o titular foi escalado.';

-- migrate:down

DROP TABLE IF EXISTS escalacoes;
