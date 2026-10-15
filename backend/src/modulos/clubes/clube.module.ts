import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clube } from '@/modulos/clubes/entities/clube.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clube])],
})
export class ClubesModule {}
