import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AuditAccessLogOrmEntity,
  AuditAccessLogService,
} from '../http/audit-access-log.service';
import { AuditAccessInterceptor } from '../http/audit-access.interceptor';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditAccessLogOrmEntity])],
  providers: [AuditAccessLogService, AuditAccessInterceptor],
  exports: [AuditAccessLogService, AuditAccessInterceptor, TypeOrmModule],
})
export class AuditModule {}
