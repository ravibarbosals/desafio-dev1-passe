import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SaudeController } from '@/modulos/saude/saude.controller';

@Module({
  imports: [TerminusModule],
  controllers: [SaudeController],
})
export class SaudeModule {}
