import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { id?: string }>();
    const res = context.switchToHttp().getResponse<Response>();

    const { method, originalUrl } = req;
    const requestId = req.id || (req.headers[REQUEST_ID_HEADER] as string) || '-';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const latency = Date.now() - startTime;
          this.logger.log(
            `[${method}] ${originalUrl} -> ${res.statusCode} | Latency: ${latency}ms | ReqID: ${requestId}`,
          );
        },
        error: (err: Error) => {
          const latency = Date.now() - startTime;
          this.logger.warn(
            `[${method}] ${originalUrl} -> Error: ${err.message} | Latency: ${latency}ms | ReqID: ${requestId}`,
          );
        },
      }),
    );
  }
}
