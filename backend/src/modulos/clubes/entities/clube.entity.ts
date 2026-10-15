import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { transformadorCentavos } from '@/core/banco/transformador-centavos';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';

@Entity('clubes')
export class Clube {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 60 })
  nome!: string;

  // ERD-005: nome em NFC e minúsculas, preenchido pela aplicação; índice único no banco (RN10)
  @Column({ name: 'nome_normalizado', type: 'varchar', length: 120 })
  nomeNormalizado!: string;

  @Column({ type: 'char', length: 3 })
  sigla!: string;

  // Centavos (DEC-037); 300,00 na criação. O default repete o do banco para o save() devolver o valor gravado
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: transformadorCentavos, default: 300 })
  caixa!: number;

  // NULL enquanto o clube não escalou (RN19)
  @Column({ type: 'varchar', length: 5, nullable: true })
  formacao!: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm!: Date;

  @OneToMany(() => Jogador, (jogador) => jogador.clube)
  jogadores?: Relation<Jogador>[];
}
