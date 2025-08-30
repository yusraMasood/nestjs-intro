import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, //The ValidationPipe can automatically transform payloads to be objects typed according to their DTO classes. To enable auto-transformation, set transform to true
      whitelist: true, //If set to true, validator will strip validated (returned) object of any properties that do not use any validation decorators.
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
