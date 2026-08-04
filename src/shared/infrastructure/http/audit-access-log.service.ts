import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Repository,
} from 'typeorm';

@Entity('audit_access_logs')
export class AuditAccessLogOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'actor_email', type: 'varchar', length: 255, nullable: true })
  actorEmail: string | null;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId: string | null;

  @Column({ type: 'varchar', length: 120 })
  action: string;

  @Column({ name: 'condominium_id', type: 'uuid', nullable: true })
  condominiumId: string | null;

  @Column({ name: 'target_id', type: 'varchar', length: 64, nullable: true })
  targetId: string | null;

  @Column({ type: 'boolean', default: true })
  success: boolean;

  @Column({ name: 'error_message', type: 'varchar', length: 500, nullable: true })
  errorMessage: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

export interface AuditAccessEntry {
  actorEmail?: string | null;
  actorUserId?: string | null;
  action: string;
  condominiumId?: string | null;
  targetId?: string | null;
  success: boolean;
  errorMessage?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditAccessLogService {
  constructor(
    @InjectRepository(AuditAccessLogOrmEntity)
    private readonly repository: Repository<AuditAccessLogOrmEntity>,
  ) {}

  async record(entry: AuditAccessEntry): Promise<void> {
    await this.repository.save(
      this.repository.create({
        id: randomUUID(),
        actorEmail: entry.actorEmail ?? null,
        actorUserId: entry.actorUserId ?? null,
        action: entry.action.slice(0, 120),
        condominiumId: entry.condominiumId ?? null,
        targetId: entry.targetId?.slice(0, 64) ?? null,
        success: entry.success,
        errorMessage: entry.errorMessage?.slice(0, 500) ?? null,
        ip: entry.ip?.slice(0, 64) ?? null,
        userAgent: entry.userAgent?.slice(0, 500) ?? null,
      }),
    );
  }
}
