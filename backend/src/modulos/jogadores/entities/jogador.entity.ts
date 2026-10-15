import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';
import { transformadorCentavos } from '@/core/banco/transformador-centavos';
import { Clube } from '@/modulos/clubes/entities/clube.entity';

// ERD-004: tipos do PostgreSQL; a ordem das posições é a ordem do elenco (RN11)
export const POSICOES_JOGADOR = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;
export type PosicaoJogador = (typeof POSICOES_JOGADOR)[number];

export const CONDICOES_JOGADOR = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;
export type CondicaoJogador = (typeof CONDICOES_JOGADOR)[number];

@Entity('jogadores')
export class Jogador {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nome!: string;

  @Column({ type: 'enum', enum: POSICOES_JOGADOR, enumName: 'posicao_jogador' })
  posicao!: PosicaoJogador;

  @Column({ type: 'integer' })
  agilidade!: number;

  @Column({ type: 'integer' })
  idade!: number;

  // Centavos (DEC-037)
  @Column({ name: 'valor_base', type: 'numeric', precision: 6, scale: 2, transformer: transformadorCentavos })
  valorBase!: number;

  // APTO no cadastro; o default repete o do banco para o save() devolver o valor gravado
  @Column({ type: 'enum', enum: CONDICOES_JOGADOR, enumName: 'condicao_jogador', default: 'APTO' })
  condicao!: CondicaoJogador;

  // NULL = jogador livre
  @Column({ name: 'clube_id', type: 'integer', nullable: true })
  clubeId!: number | null;

  @ManyToOne(() => Clube, (clube) => clube.jogadores)
  @JoinColumn({ name: 'clube_id' })
  clube?: Relation<Clube> | null;

  @Column({ type: 'integer' })
  velocidade!: number;

  @Column({ type: 'integer' })
  finalizacao!: number;

  @Column({ type: 'integer' })
  passe!: number;

  @Column({ type: 'integer' })
  drible!: number;

  @Column({ type: 'integer' })
  defesa!: number;

  @Column({ type: 'integer' })
  fisico!: number;

  @Column({ type: 'integer' })
  potencial!: number;

  // Exclusão lógica (RN09): coluna comum, e não @DeleteDateColumn, para o filtro ficar explícito em cada consulta
  @Column({ name: 'excluido_em', type: 'timestamptz', nullable: true })
  excluidoEm!: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm!: Date;
}
