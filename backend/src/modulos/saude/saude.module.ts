import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SaudeController } from '@/modulos/saude/controllers/saude.controller';

@Module({
  imports: [TerminusModule],
  controllers: [SaudeController],
})
export class SaudeModule {}
