import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RabbitMQ } from './common/constants';
import { TimeOutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
      transport: Transport.RMQ,
      options: {
        url: [process.env.AMQP_URL],
        queue: RabbitMQ.TimeOffQueue
      },
    });
  app.useGlobalInterceptors(new TimeOutInterceptor);
  await app.listen();
}
bootstrap();
