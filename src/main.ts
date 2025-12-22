import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import { NetworkErrorInterceptor } from './core/interceptors/network-error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

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
  // CORS FOR ANGULAR
  // ----------------------------------------
  app.enableCors({
    origin: 'https://nextlevelapp.blueaisolutions.com',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // ----------------------------------------
  // COOKIE PARSER (must be after helmet)
  // ----------------------------------------
  app.use(cookieParser());

  // ----------------------------------------
  // CSRF PROTECTION
  // ----------------------------------------
  const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    // Secret used for HMAC signing. Keep stable & private.
    getSecret: () => process.env.CSRF_SECRET!,

    /**
     * IMPORTANT:
     * Bind CSRF tokens to something user-specific that rotates when auth rotates.
     *
     * With access+refresh cookies:
     * - Prefer refresh token (or its jti) because it's the “session-like” identifier.
     * - When you rotate refresh tokens, you should also issue a new CSRF token. :contentReference[oaicite:5]{index=5}
     */
    getSessionIdentifier: (req) => {
      // example cookie names — adjust to yours
      return req.cookies?.refresh_token ?? 'anonymous';
    },

    // If your frontend is on a DIFFERENT site, you typically need SameSite=None; Secure
    // csrf-csrf default is strict :contentReference[oaicite:6]{index=6} so override for cross-site SPA:
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    },

    // Default header is x-csrf-token :contentReference[oaicite:8]{index=8}
    getCsrfTokenFromRequest: (req) =>
      req.headers['x-csrf-token'] as string | undefined,

    // Optional: skip CSRF for the token-minting route
    skipCsrfProtection: (req) =>
      req.path === '/auth/csrf-token' ||
      req.path === '/auth/refresh' ||
      req.path === '/auth/logout' ||
      req.path === '/auth/login',
  });

  // 4) Create an UNPROTECTED route that mints a CSRF token + sets the CSRF cookie.
  // This mirrors the library’s recommended “/csrf-token” approach. :contentReference[oaicite:9]{index=9}
  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.get('/auth/csrf-token', (req, res) => {
    const csrfToken = generateCsrfToken(req, res);
    res.json({ csrfToken });
  });

  // 5) Apply protection globally (protects non-GET/HEAD/OPTIONS by default) :contentReference[oaicite:10]{index=10}
  app.use(doubleCsrfProtection);

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
