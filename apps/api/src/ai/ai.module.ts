import { Module } from '@nestjs/common';
import { AIService } from './ai-service';
import { AIController } from './ai.controller';
import { ConnectorsModule } from '../connectors/connectors.module';

@Module({
  imports: [ConnectorsModule],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
