import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class NetworkErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const networkErrors = ['ECONNREFUSED', 'ENETUNREACH', 'ETIMEDOUT'];

        if (networkErrors.includes(err.code)) {
          return throwError(
            () =>
              new HttpException(
                'External API unreachable. Make sure VPN is connected.',
                HttpStatus.SERVICE_UNAVAILABLE,
              ),
          );
        }

        return throwError(() => err);
      }),
    );
  }
}
