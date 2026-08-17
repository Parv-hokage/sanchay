import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse, AppErrorCode } from '../../shared';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

import { ZodError } from 'zod';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    const requestId =
      request.id || (request.headers[REQUEST_ID_HEADER] as string) || 'unknown-req-id';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = AppErrorCode.INTERNAL_ERROR;
    let message = 'An unexpected internal server error occurred.';
    let details: Record<string, unknown> | null = null;

    if (exception instanceof ZodError || (exception as Error)?.name === 'ZodError') {
      const zodErr = exception as ZodError;
      status = HttpStatus.BAD_REQUEST;
      code = AppErrorCode.VALIDATION_ERROR;
      const formattedErrors = zodErr.errors
        .map((err) => {
          const fieldPath = err.path.join('.') || 'field';
          return `${fieldPath}: ${err.message}`;
        })
        .join('; ');
      message = `Validation failed: ${formattedErrors}`;
      details = {
        validationErrors: zodErr.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        code = (resObj.code as string) || this.mapStatusToErrorCode(status);
        if (resObj.details && typeof resObj.details === 'object') {
          details = resObj.details as Record<string, unknown>;
        } else if (Array.isArray(resObj.message)) {
          details = { validationErrors: resObj.message };
          message = 'Validation failed for the submitted data.';
          code = AppErrorCode.VALIDATION_ERROR;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[Unhandled Error] [Req: ${requestId}] ${exception.message}`,
        exception.stack,
      );
    }

    const errorPayload: ApiErrorResponse = {
      error: {
        code,
        message,
        details,
        requestId,
      },
    };

    response.status(status).json(errorPayload);
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return AppErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return AppErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return AppErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return AppErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return AppErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return AppErrorCode.RATE_LIMITED;
      default:
        return AppErrorCode.INTERNAL_ERROR;
    }
  }
}
