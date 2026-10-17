import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LigaController } from '@/modulos/liga/controllers/liga.controller';
import { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { Partida } from '@/modulos/liga/entities/partida.entity';
import { LigaService } from '@/modulos/liga/services/liga.service';

@Module({
  imports: [TypeOrmModule.forFeature([Escalacao, Partida, DueloPartida])],
  controllers: [LigaController],
  providers: [LigaService],
})
export class LigaModule {}
