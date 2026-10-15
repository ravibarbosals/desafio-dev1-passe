import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DueloPartida } from '@/modulos/liga/entities/duelo-partida.entity';
import { Escalacao } from '@/modulos/liga/entities/escalacao.entity';
import { Partida } from '@/modulos/liga/entities/partida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escalacao, Partida, DueloPartida])],
})
export class LigaModule {}