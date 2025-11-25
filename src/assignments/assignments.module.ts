import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AssignmentsDAO } from './dao/assignments.dao';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    ClientsModule.registerAsync([
      {
        name: 'COURSE_GRPC',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'course',
            protoPath: require.resolve('ulms-contracts/protos/course.proto'),
            url: cfg.get<string>('COURSE_GRPC_URL') ?? '0.0.0.0:50053',
            loader: {
              longs: String,
              enums: String,
              defaults: false,
              objects: true,
              arrays: true
            }
          }
        }),
        inject: [ConfigService]
      },
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [cfg.get<string>('KAFKA_BROKER') ?? 'localhost:9092'],
            },
            consumer: {
              groupId: 'assignment-service-consumer',
            }
          }
        }),
        inject: [ConfigService]
      },
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsDAO],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
