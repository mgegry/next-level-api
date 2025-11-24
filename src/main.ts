import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // SETUP SWAGGER
  const config = new DocumentBuilder()
    .setTitle('ERP HUB API')
    .setDescription('The endpoints to the erp hub')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // SETUP LOGGER
  app.useLogger(new Logger());

  app.use(cookieParser());

  // START APP
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
