-- migrate:up

CREATE TYPE situacao_contrato AS ENUM ('ATIVO', 'ENCERRADO', 'RESCINDIDO');

COMMENT ON TYPE situacao_contrato IS 'Situação do contrato: ATIVO na compra; RESCINDIDO (com multa) ou ENCERRADO (sem multa) na venda (RN15).';

CREATE TABLE contratos (
  id             SERIAL            PRIMARY KEY,
  jogador_id     INTEGER           NOT NULL,
  clube_id       INTEGER           NOT NULL,
  valor_compra   NUMERIC(6,2)      NOT NULL,
  fidelidade_ate TIMESTAMPTZ       NOT NULL,
  situacao       situacao_contrato NOT NULL,
  iniciado_em    TIMESTAMPTZ       NOT NULL,
  encerrado_em   TIMESTAMPTZ       NULL,
  CONSTRAINT fk_contratos_jogador FOREIGN KEY (jogador_id) REFERENCES jogadores (id) ON DELETE RESTRICT,
  CONSTRAINT fk_contratos_clube FOREIGN KEY (clube_id) REFERENCES clubes (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_contratos_jogador_ativo ON contratos (jogador_id) WHERE situacao = 'ATIVO';
CREATE INDEX idx_contratos_clube_id ON contratos (clube_id);

COMMENT ON COLUMN contratos.id IS 'Identificador do contrato (PK).';
COMMENT ON COLUMN contratos.jogador_id IS 'Jogador contratado. FK para jogadores(id).';
COMMENT ON COLUMN contratos.clube_id IS 'Clube comprador. FK para clubes(id).';
COMMENT ON COLUMN contratos.valor_compra IS 'Valor de mercado pago na compra, sem a taxa (RN16).';
COMMENT ON COLUMN contratos.fidelidade_ate IS 'Fim da fidelidade: depois da compra e até 1.095 dias.';
COMMENT ON COLUMN contratos.situacao IS 'ATIVO na compra; RESCINDIDO (venda com multa) ou ENCERRADO (venda sem multa). Um só ATIVO por jogador (índice parcial).';
COMMENT ON COLUMN contratos.iniciado_em IS 'Momento da compra.';
COMMENT ON COLUMN contratos.encerrado_em IS 'Momento da venda. NULL enquanto ATIVO.';

-- migrate:down

DROP TABLE IF EXISTS contratos;
DROP TYPE IF EXISTS situacao_contrato;
