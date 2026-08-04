import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

import { AUDIT_ACCESS_KEY } from './audit-access.decorator';
import { AuditAccessLogService } from './audit-access-log.service';

interface AuditedRequest {
  params?: Record<string, string>;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  user?: { email?: string; sub?: string };
}

const ANONYMOUS = 'formulário público';

/**
 * Trilha LGPD: log + persistência em audit_access_logs (sem gravar dados pessoais do alvo).
 */
@Injectable()
export class AuditAccessInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TrilhaDeAcesso');

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogs: AuditAccessLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string | undefined>(AUDIT_ACCESS_KEY, context.getHandler());

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuditedRequest>();
    const actorEmail = request.user?.email ?? ANONYMOUS;
    const entryLabel = `${actorEmail} ${action}${AuditAccessInterceptor.targetOf(request)}`;
    const base = {
      actorEmail: request.user?.email ?? null,
      actorUserId: request.user?.sub ?? null,
      action,
      condominiumId: request.params?.condominiumId ?? request.params?.id ?? null,
      targetId: request.params?.id ?? request.params?.residentId ?? null,
      ip: request.ip ?? null,
      userAgent: AuditAccessInterceptor.header(request, 'user-agent'),
    };

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(entryLabel);
          void this.auditLogs.record({ ...base, success: true }).catch((error: unknown) => {
            this.logger.warn(`Falha ao persistir auditoria: ${String(error)}`);
          });
        },
        error: (error: unknown) => {
          const reason = AuditAccessInterceptor.reasonOf(error);
          this.logger.warn(`${entryLabel} — falhou: ${reason}`);
          void this.auditLogs
            .record({ ...base, success: false, errorMessage: reason })
            .catch((persistError: unknown) => {
              this.logger.warn(`Falha ao persistir auditoria: ${String(persistError)}`);
            });
        },
      }),
    );
  }

  private static targetOf({ params }: AuditedRequest): string {
    return params?.id ? ` (cadastro ${params.id})` : '';
  }

  private static reasonOf(error: unknown): string {
    return error instanceof Error ? error.message : 'erro desconhecido';
  }

  private static header(request: AuditedRequest, name: string): string | null {
    const value = request.headers?.[name];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  }
}
