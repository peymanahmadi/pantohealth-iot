import { Transport, ClientOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

// interface RabbitMQConfigOptions {
//   urls: string[];
//   queue: string;
//   queueOptions?: {
//     durable?: boolean;
//   };
//   noAck?: boolean;
//   prefetchCount?: number;
// }

// export const getRabbitMQConfig = (
//   configService: ConfigService,
// ): ClientOptions => ({
//   transport: Transport.RMQ,
//   options: {
//     urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
//     queue: configService.get<string>('RABBITMQ_QUEUE', 'x-ray'),
//     queueOptions: {
//       durable: true,
//     },
//   } as RabbitMQConfigOptions,
// });

export const getRabbitMQConfig = (
  configService: ConfigService,
): ClientOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
    queue: configService.get<string>('RABBITMQ_QUEUE', 'x-ray'),
    queueOptions: {
      durable: true,
    },
  }
});