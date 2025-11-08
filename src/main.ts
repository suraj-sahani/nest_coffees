import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Transforms all payload body to the assigned types
    whitelist: true, // Removes any properties that are not in the DTO
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
