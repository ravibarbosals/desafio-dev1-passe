import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';

@Entity('partidas')
export class Partida {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'mandante_id', type: 'integer' })
  mandanteId!: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'mandante_id' })
  mandante?: Relation<Clube>;

  @Column({ name: 'visitante_id', type: 'integer' })
  visitanteId!: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'visitante_id' })
  visitante?: Relation<Clube>;

  @Column({ name: 'gols_mandante', type: 'integer' })
  golsMandante!: number;

  @Column({ name: 'gols_visitante', type: 'integer' })
  golsVisitante!: number;

  @Column({ name: 'formacao_mandante', type: 'varchar', length: 5 })
  formacaoMandante!: string;

  @Column({ name: 'formacao_visitante', type: 'varchar', length: 5 })
  formacaoVisitante!: string;

  @Column({ name: 'jogada_em', type: 'timestamptz' })
  jogadaEm!: Date;

  @OneToMany(() => DueloPartida, (duelo) => duelo.partida)
  duelos?: Relation<DueloPartida>[];
}
