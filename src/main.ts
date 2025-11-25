import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  await app.init();
  logger.log('Application initialized, all modules ready');

  // Connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'assignment',
      protoPath: require.resolve('ulms-contracts/protos/assignment.proto'),
      url: '0.0.0.0:50054',
    },
  });

  // Connect Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'assignment-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'assignment-service-consumer-server',
      },
    },
  });

  // Start all microservices
  await app.startAllMicroservices();
  logger.log('gRPC microservice started on 0.0.0.0:50054');
  logger.log('Kafka consumer started');
}
bootstrap();
