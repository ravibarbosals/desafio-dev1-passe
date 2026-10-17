import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoController } from '@/modulos/mercado/controllers/mercado.controller';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';
import { Transacao } from '@/modulos/mercado/entities/transacao.entity';
import { MercadoService } from '@/modulos/mercado/services/mercado.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato, Transacao])],
  controllers: [MercadoController],
  providers: [MercadoService],
})
export class MercadoModule {}
