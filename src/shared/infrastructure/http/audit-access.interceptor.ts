import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

import { AUDIT_ACCESS_KEY } from './audit-access.decorator';

/** Only what the trail needs; the request carries much more than that. */
interface AuditedRequest {
  params?: Record<string, string>;
  user?: { email?: string };
}

const ANONYMOUS = 'formulário público';

/**
 * Access trail required by the LGPD: registers who read, exported or removed
 * personal data. Records the actor, the action and the affected registration —
 * never the data itself, so the log does not become a second copy of it.
 */
@Injectable()
export class AuditAccessInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TrilhaDeAcesso');

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string | undefined>(AUDIT_ACCESS_KEY, context.getHandler());

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuditedRequest>();
    const entry = `${request.user?.email ?? ANONYMOUS} ${action}${AuditAccessInterceptor.targetOf(request)}`;

    return next.handle().pipe(
      tap({
        next: () => this.logger.log(entry),
        error: (error: unknown) =>
          this.logger.warn(`${entry} — falhou: ${AuditAccessInterceptor.reasonOf(error)}`),
      }),
    );
  }

  private static targetOf({ params }: AuditedRequest): string {
    return params?.id ? ` (cadastro ${params.id})` : '';
  }

  private static reasonOf(error: unknown): string {
    return error instanceof Error ? error.message : 'erro desconhecido';
  }
}
