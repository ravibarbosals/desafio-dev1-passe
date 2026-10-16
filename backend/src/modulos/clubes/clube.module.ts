import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubesController } from '@/modulos/clubes/controllers/clubes.controller';
import { Clube } from '@/modulos/clubes/entities/clube.entity';
import { ClubesService } from '@/modulos/clubes/services/clubes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clube])],
  controllers: [ClubesController],
  providers: [ClubesService],
})
export class ClubesModule {}
