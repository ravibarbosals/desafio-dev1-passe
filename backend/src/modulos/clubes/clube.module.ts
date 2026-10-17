import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubesController } from '@/modulos/clubes/controllers/clubes.controller';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { ClubesService } from '@/modulos/clubes/services/clubes.service';
import { Jogador } from '@/modulos/jogadores/entities/jogador.entity';
import { Contrato } from '@/modulos/mercado/entities/contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clube, Jogador, Contrato])],
  controllers: [ClubesController],
  providers: [ClubesService],
})
export class ClubesModule {}
