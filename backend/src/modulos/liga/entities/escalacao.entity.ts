import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';

// Uma linha por titular; PK (clube_id, jogador_id) e jogador_id único: um jogador em no máximo uma escalação
@Entity('escalacoes')
export class Escalacao {
  @PrimaryColumn({ name: 'clube_id', type: 'integer' })
  clubeId!: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_id' })
  clube?: Relation<Clube>;

  @PrimaryColumn({ name: 'jogador_id', type: 'integer' })
  jogadorId!: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'jogador_id' })
  jogador?: Relation<Jogador>;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;
}
