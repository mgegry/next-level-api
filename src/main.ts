import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {} from 'csrf-csrf';
import { NetworkErrorInterceptor } from './core/interceptors/network-error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

  // ----------------------------------------
  // GLOBAL INTERCEPTORS
  // ----------------------------------------
  app.useGlobalInterceptors(new NetworkErrorInterceptor());

  // ----------------------------------------
  // GLOBAL PIPES (Add this section)
  // ----------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Key for your "Two Query Object" approach
      transform: true, // Key for converting "1" (string) to 1 (number)
      // forbidNonWhitelisted: true, // Optional: Throws error if user sends extra params
    }),
  );

  // ----------------------------------------
  // CORS FOR ANGULAR
  // ----------------------------------------
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ----------------------------------------
  // HELMET SECURITY
  // ----------------------------------------
  app.use(
    helmet({
      // Angular often loads resources across origins → this prevents blocking
      crossOriginResourcePolicy: false,
    }),
  );

  // Enable stricter HSTS only in PRODUCTION (never enable this on localhost!)
  if (isProd) {
    app.use(
      helmet.hsts({
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true, // allow chrome preload list (optional)
      }),
    );
  }

  // ----------------------------------------
  // COOKIE PARSER (must be after helmet)
  // ----------------------------------------
  app.use(cookieParser());

  // ----------------------------------------
  // SWAGGER SETUP
  // ----------------------------------------
  const config = new DocumentBuilder()
    .setTitle('ERP HUB API')
    .setDescription('The endpoints to the erp hub')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // ----------------------------------------
  // CUSTOM LOGGER
  // ----------------------------------------
  app.useLogger(new Logger());

  // ----------------------------------------
  // START SERVER
  // ----------------------------------------
  await app.listen(process.env.PORT ?? 3333);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3333}`);
}
bootstrap();
