import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { CONDICOES_JOGADOR, CondicaoJogador, Jogador, POSICOES_JOGADOR, PosicaoJogador } from '@/modulos/jogadores/entities/jogador.entity';
import { Partida } from '@/modulos/liga/entities/partida.entity';

// Fotografia de cada duelo no momento da partida (RN20): nomes, posições e condições não mudam depois
@Entity('duelos_partida')
export class DueloPartida {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'partida_id', type: 'integer' })
  partidaId!: number;

  @ManyToOne(() => Partida, (partida) => partida.duelos)
  @JoinColumn({ name: 'partida_id' })
  partida?: Relation<Partida>;

  // 1 a 3: ataques do mandante; 4 a 6: do visitante
  @Column({ type: 'integer' })
  ordem!: number;

  @Column({ name: 'clube_atacante_id', type: 'integer' })
  clubeAtacanteId!: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_atacante_id' })
  clubeAtacante?: Relation<Clube>;

  @Column({ name: 'atacante_id', type: 'integer' })
  atacanteId!: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'atacante_id' })
  atacante?: Relation<Jogador>;

  @Column({ name: 'defensor_id', type: 'integer' })
  defensorId!: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'defensor_id' })
  defensor?: Relation<Jogador>;

  @Column({ name: 'nome_atacante', type: 'varchar', length: 100 })
  nomeAtacante!: string;

  @Column({ name: 'nome_defensor', type: 'varchar', length: 100 })
  nomeDefensor!: string;

  @Column({ name: 'posicao_atacante', type: 'enum', enum: POSICOES_JOGADOR, enumName: 'posicao_jogador' })
  posicaoAtacante!: PosicaoJogador;

  @Column({ name: 'posicao_defensor', type: 'enum', enum: POSICOES_JOGADOR, enumName: 'posicao_jogador' })
  posicaoDefensor!: PosicaoJogador;

  @Column({ name: 'condicao_atacante', type: 'enum', enum: CONDICOES_JOGADOR, enumName: 'condicao_jogador' })
  condicaoAtacante!: CondicaoJogador;

  @Column({ name: 'condicao_defensor', type: 'enum', enum: CONDICOES_JOGADOR, enumName: 'condicao_jogador' })
  condicaoDefensor!: CondicaoJogador;

  @Column({ name: 'atributo_ataque', type: 'varchar', length: 10 })
  atributoAtaque!: string;

  @Column({ name: 'atributo_defesa', type: 'varchar', length: 10 })
  atributoDefesa!: string;

  @Column({ name: 'valor_ataque', type: 'integer' })
  valorAtaque!: number;

  @Column({ name: 'valor_defesa', type: 'integer' })
  valorDefesa!: number;

  @Column({ type: 'boolean' })
  gol!: boolean;
}