-- migrate:up

CREATE TABLE duelos_partida (
  id                SERIAL           PRIMARY KEY,
  partida_id        INTEGER          NOT NULL,
  ordem             INTEGER          NOT NULL,
  clube_atacante_id INTEGER          NOT NULL,
  atacante_id       INTEGER          NOT NULL,
  defensor_id       INTEGER          NOT NULL,
  nome_atacante     VARCHAR(100)     NOT NULL,
  nome_defensor     VARCHAR(100)     NOT NULL,
  posicao_atacante  posicao_jogador  NOT NULL,
  posicao_defensor  posicao_jogador  NOT NULL,
  condicao_atacante condicao_jogador NOT NULL,
  condicao_defensor condicao_jogador NOT NULL,
  atributo_ataque   VARCHAR(10)      NOT NULL,
  atributo_defesa   VARCHAR(10)      NOT NULL,
  valor_ataque      INTEGER          NOT NULL,
  valor_defesa      INTEGER          NOT NULL,
  gol               BOOLEAN          NOT NULL,
  CONSTRAINT fk_duelos_partida_partida FOREIGN KEY (partida_id) REFERENCES partidas (id) ON DELETE RESTRICT,
  CONSTRAINT fk_duelos_partida_clube_atacante FOREIGN KEY (clube_atacante_id) REFERENCES clubes (id) ON DELETE RESTRICT,
  CONSTRAINT fk_duelos_partida_atacante FOREIGN KEY (atacante_id) REFERENCES jogadores (id) ON DELETE RESTRICT,
  CONSTRAINT fk_duelos_partida_defensor FOREIGN KEY (defensor_id) REFERENCES jogadores (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_duelos_partida_partida_ordem ON duelos_partida (partida_id, ordem);

COMMENT ON COLUMN duelos_partida.id IS 'Identificador do duelo (PK).';
COMMENT ON COLUMN duelos_partida.partida_id IS 'Partida do duelo. FK para partidas(id).';
COMMENT ON COLUMN duelos_partida.ordem IS 'De 1 a 6: 1 a 3 são os ataques do mandante; 4 a 6, os do visitante (RN20).';
COMMENT ON COLUMN duelos_partida.clube_atacante_id IS 'Clube que ataca no duelo. FK para clubes(id).';
COMMENT ON COLUMN duelos_partida.atacante_id IS 'Jogador que ataca. FK para jogadores(id).';
COMMENT ON COLUMN duelos_partida.defensor_id IS 'Jogador que defende. FK para jogadores(id).';
COMMENT ON COLUMN duelos_partida.nome_atacante IS 'Nome do atacante no momento da partida.';
COMMENT ON COLUMN duelos_partida.nome_defensor IS 'Nome do defensor no momento da partida.';
COMMENT ON COLUMN duelos_partida.posicao_atacante IS 'Posição do atacante no momento da partida.';
COMMENT ON COLUMN duelos_partida.posicao_defensor IS 'Posição do defensor no momento da partida.';
COMMENT ON COLUMN duelos_partida.condicao_atacante IS 'Condição do atacante: só APTO ou MAL_CONDICIONADO (titular DOENTE não joga).';
COMMENT ON COLUMN duelos_partida.condicao_defensor IS 'Condição do defensor: só APTO ou MAL_CONDICIONADO.';
COMMENT ON COLUMN duelos_partida.atributo_ataque IS 'shooting (ATA), passing (MEI) ou dribbling (ZAG, LAT).';
COMMENT ON COLUMN duelos_partida.atributo_defesa IS 'Sempre defending.';
COMMENT ON COLUMN duelos_partida.valor_ataque IS 'Valor de ataque usado, já com o efeito da condição (x 0,85 se MAL_CONDICIONADO).';
COMMENT ON COLUMN duelos_partida.valor_defesa IS 'Valor de defesa usado, já com o efeito da condição.';
COMMENT ON COLUMN duelos_partida.nome_atacante IS 'Nome do atacante no momento da partida.';
COMMENT ON COLUMN duelos_partida.nome_defensor IS 'Nome do defensor no momento da partida.';
COMMENT ON COLUMN duelos_partida.posicao_atacante IS 'Posição do atacante no momento da partida.';
COMMENT ON COLUMN duelos_partida.posicao_defensor IS 'Posição do defensor no momento da partida.';
COMMENT ON COLUMN duelos_partida.condicao_atacante IS 'Condição do atacante: só APTO ou MAL_CONDICIONADO (titular DOENTE não joga).';
COMMENT ON COLUMN duelos_partida.condicao_defensor IS 'Condição do defensor: só APTO ou MAL_CONDICIONADO.';
COMMENT ON COLUMN duelos_partida.atributo_ataque IS 'shooting (ATA), passing (MEI) ou dribbling (ZAG, LAT).';
COMMENT ON COLUMN duelos_partida.atributo_defesa IS 'Sempre defending.';
COMMENT ON COLUMN duelos_partida.valor_ataque IS 'Valor de ataque usado, já com o efeito da condição (x 0,85 se MAL_CONDICIONADO).';
COMMENT ON COLUMN duelos_partida.valor_defesa IS 'Valor de defesa usado, já com o efeito da condição.';
COMMENT ON COLUMN duelos_partida.gol IS 'TRUE quando o ataque é maior que a defesa.';

-- migrate:down

DROP TABLE IF EXISTS duelos_partida;