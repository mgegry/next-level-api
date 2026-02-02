import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { id?: string; user?: any }>();
    const res = ctx.getResponse<Response>();

    const requestId = (req as any).id;
    const userId = (req as any).user?.id;
    const tenantId = (req as any).user?.tenantId;

    // If it's an HTTP exception, it may be expected (401/403/404/400)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      // Log only unexpected server-side HTTP errors (5xx)
      if (status >= 500) {
        this.logger.error(
          {
            err: exception,
            requestId,
            userId,
            tenantId,
            method: req.method,
            url: req.url,
          },
          'HTTP exception (5xx)',
        );
      }

      const body = exception.getResponse();
      return res.status(status).json(body);
    }

    // Non-HttpException => unexpected error (bug, DB outage, etc.)
    this.logger.error(
      {
        err: exception,
        requestId,
        userId,
        tenantId,
        method: req.method,
        url: req.url,
      },
      'Unhandled exception',
    );

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal server error',
      requestId,
    });
  }
}
