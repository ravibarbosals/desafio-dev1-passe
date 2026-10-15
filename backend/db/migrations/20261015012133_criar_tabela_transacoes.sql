-- migrate:up

CREATE TABLE transacoes (
  id             SERIAL        PRIMARY KEY,
  clube_id       INTEGER       NOT NULL,
  jogador_id     INTEGER       NOT NULL,
  nome_jogador   VARCHAR(100)  NOT NULL,
  tipo           VARCHAR(6)    NOT NULL,
  valor          NUMERIC(6,2)  NOT NULL,
  taxa           NUMERIC(6,2)  NOT NULL,
  multa          NUMERIC(6,2)  NOT NULL,
  lucro          NUMERIC(7,2)  NULL,
  variacao_caixa NUMERIC(8,2)  NOT NULL,
  criado_em      TIMESTAMPTZ   NOT NULL,
  CONSTRAINT fk_transacoes_clube FOREIGN KEY (clube_id) REFERENCES clubes (id) ON DELETE RESTRICT,
  CONSTRAINT fk_transacoes_jogador FOREIGN KEY (jogador_id) REFERENCES jogadores (id) ON DELETE RESTRICT
);

CREATE INDEX idx_transacoes_clube_criado_em ON transacoes (clube_id, criado_em DESC, id DESC);
CREATE INDEX idx_transacoes_clube_jogador ON transacoes (clube_id, jogador_id);

COMMENT ON COLUMN transacoes.id IS 'Identificador da transação (PK).';
COMMENT ON COLUMN transacoes.clube_id IS 'Clube da operação. FK para clubes(id).';
COMMENT ON COLUMN transacoes.jogador_id IS 'Jogador da operação. FK para jogadores(id).';
COMMENT ON COLUMN transacoes.nome_jogador IS 'Nome do jogador no momento da operação; não muda se o jogador for renomeado (RN17).';
COMMENT ON COLUMN transacoes.tipo IS 'COMPRA ou VENDA. Validado no service (DEC-011).';
COMMENT ON COLUMN transacoes.valor IS 'Valor de mercado no momento da operação.';
COMMENT ON COLUMN transacoes.taxa IS 'Taxa de compra (RN13) ou comissão de venda (RN16).';
COMMENT ON COLUMN transacoes.multa IS 'Multa por fidelidade (RN15); 0.00 na compra.';
COMMENT ON COLUMN transacoes.lucro IS 'Lucro da venda, com sinal (RN16). NULL na compra.';
COMMENT ON COLUMN transacoes.variacao_caixa IS 'Variação do caixa com sinal: -(valor + taxa) na compra; valor - multa - comissão na venda. 300.00 + soma = caixa atual.';
COMMENT ON COLUMN transacoes.criado_em IS 'Data e hora da operação.';

-- migrate:down

DROP TABLE IF EXISTS transacoes;
