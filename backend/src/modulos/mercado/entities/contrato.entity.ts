import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { transformadorCentavos } from '@/core/banco/transformador-centavos';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';

// ERD-004; ATIVO na compra, RESCINDIDO (com multa) ou ENCERRADO (sem multa) na venda (RN15)
export const SITUACOES_CONTRATO = ['ATIVO', 'ENCERRADO', 'RESCINDIDO'] as const;
export type SituacaoContrato = (typeof SITUACOES_CONTRATO)[number];

@Entity('contratos')
export class Contrato {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'jogador_id', type: 'integer' })
  jogadorId!: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'jogador_id' })
  jogador?: Relation<Jogador>;

  @Column({ name: 'clube_id', type: 'integer' })
  clubeId!: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_id' })
  clube?: Relation<Clube>;

  // Centavos (DEC-037)
  @Column({ name: 'valor_compra', type: 'numeric', precision: 6, scale: 2, transformer: transformadorCentavos })
  valorCompra!: number;

  @Column({ name: 'fidelidade_ate', type: 'timestamptz' })
  fidelidadeAte!: Date;

  @Column({ type: 'enum', enum: SITUACOES_CONTRATO, enumName: 'situacao_contrato' })
  situacao!: SituacaoContrato;

  @Column({ name: 'iniciado_em', type: 'timestamptz' })
  iniciadoEm!: Date;

  @Column({ name: 'encerrado_em', type: 'timestamptz', nullable: true })
  encerradoEm!: Date | null;
}
