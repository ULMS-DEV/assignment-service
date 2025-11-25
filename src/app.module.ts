import { Module } from '@nestjs/common';
import { AssignmentsModule } from './assignments/assignments.module';
import { PrismaModule } from './prisma/prisma.module';
import { KafkaModule } from './kafka/kafka.module';
import { AnalysisConsumerController } from './kafka/analysis-consumer.controller';

@Module({
  imports: [
    PrismaModule,
    AssignmentsModule,
    KafkaModule
  ],
  controllers: [AnalysisConsumerController],
})
export class AppModule {}
