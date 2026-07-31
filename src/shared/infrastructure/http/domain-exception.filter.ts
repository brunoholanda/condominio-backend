import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

import {
  AuthenticationError,
  DomainError,
  InvalidFieldError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../domain/domain-error';

/**
 * Keeps the domain free of HTTP concerns: business errors bubble up as plain
 * domain objects and are translated into status codes only at the edge.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status = DomainExceptionFilter.resolveStatus(exception);

    this.logger.warn(`${request.method} ${request.url} -> ${exception.name}: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
      field: exception instanceof InvalidFieldError ? exception.field : undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private static resolveStatus(exception: DomainError): HttpStatus {
    if (exception instanceof InvalidFieldError) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof AuthenticationError) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof ResourceNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }

    if (exception instanceof ResourceConflictError) {
      return HttpStatus.CONFLICT;
    }

    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
