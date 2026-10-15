import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Jogador])],
})
export class JogadoresModule {}
