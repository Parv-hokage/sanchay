import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse } from '@sanchay/shared';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request & { id?: string }>();
    const requestId =
      request.id || (request.headers[REQUEST_ID_HEADER] as string) || 'unknown-req-id';

    return next.handle().pipe(
      map((data) => {
        // If data is already an envelope, return it
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return data;
        }

        return {
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
