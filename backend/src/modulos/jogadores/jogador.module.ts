import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { JogadoresController } from '@/modulos/jogadores/controllers/jogadores.controller';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { JogadoresService } from '@/modulos/jogadores/services/jogadores.service';

// Clube entra só para conferir o filtro club_id (404 para clube inexistente)
@Module({
  imports: [TypeOrmModule.forFeature([Jogador, Clube])],
  controllers: [JogadoresController],
  providers: [JogadoresService],
})
export class JogadoresModule {}
