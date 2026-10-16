import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JogadoresController } from '@/modulos/jogadores/controllers/jogadores.controller';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { JogadoresService } from '@/modulos/jogadores/services/jogadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Jogador])],
  controllers: [JogadoresController],
  providers: [JogadoresService],
})
export class JogadoresModule {}
