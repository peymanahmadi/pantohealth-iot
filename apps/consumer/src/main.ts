import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create a hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672'),
      ],
      queue: configService.get<string>('RABBITMQ_QUEUE', 'x-ray'),
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PANTOhealth X-Ray API')
    .setDescription('API for managing x-ray data from IoT devices')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Start the HTTP server and microservice
  await app.startAllMicroservices();
  await app.listen(configService.get<number>('CONSUMER_PORT', 4000));
  logger.log(
    `Application is running on port: ${configService.get<number>('CONSUMER_PORT', 4000)}`,
  );
}
bootstrap();
