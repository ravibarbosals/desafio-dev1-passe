import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato, Transacao])],
})
export class MercadoModule {}