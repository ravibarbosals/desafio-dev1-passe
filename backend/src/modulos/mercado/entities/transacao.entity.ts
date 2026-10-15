import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { transformadorCentavos } from '@/core/banco/transformador-centavos';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';

// VARCHAR no banco, validado no service (DEC-011, ERD-004)
export const TIPOS_TRANSACAO = ['COMPRA', 'VENDA'] as const;
export type TipoTransacao = (typeof TIPOS_TRANSACAO)[number];

// Valores em centavos (DEC-037)
@Entity('transacoes')
export class Transacao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'clube_id', type: 'integer' })
  clubeId!: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_id' })
  clube?: Relation<Clube>;

  @Column({ name: 'jogador_id', type: 'integer' })
  jogadorId!: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'jogador_id' })
  jogador?: Relation<Jogador>;

  // Nome no momento da operação (RN17)
  @Column({ name: 'nome_jogador', type: 'varchar', length: 100 })
  nomeJogador!: string;

  @Column({ type: 'varchar', length: 6 })
  tipo!: TipoTransacao;

  @Column({ type: 'numeric', precision: 6, scale: 2, transformer: transformadorCentavos })
  valor!: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, transformer: transformadorCentavos })
  taxa!: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, transformer: transformadorCentavos })
  multa!: number;

  // NULL na compra
  @Column({ type: 'numeric', precision: 7, scale: 2, transformer: transformadorCentavos, nullable: true })
  lucro!: number | null;

  @Column({ name: 'variacao_caixa', type: 'numeric', precision: 8, scale: 2, transformer: transformadorCentavos })
  variacaoCaixa!: number;

  @Column({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;
}
