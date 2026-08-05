import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import {
  BusinessRuleError,
  InvalidFieldError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { FileStorage } from '../../../../shared/application/ports/file-storage';
import { StorageKeys } from '../../../../shared/infrastructure/storage/storage-keys';
import { GetCondominiumBySlugUseCase } from '../../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { GetCondominiumUseCase } from '../../../condominiums/application/use-cases/get-condominium.use-case';
import { TimePunch } from '../../domain/entities/time-punch';
import {
  nextPunchType,
  PunchStatus,
  PunchType,
} from '../../domain/enums/staff.enums';
import { haversineDistanceMeters } from '../../domain/geofence';
import { CondoEmployeeRepository } from '../../domain/repositories/condo-employee.repository';
import { TimePunchRepository } from '../../domain/repositories/time-punch.repository';
import type { ListPunchesQueryDto } from '../dto/staff-auth.dto';
import type { TimePunchResponseDto } from '../dto/time-punch-response.dto';
import { TimePunchPresenter } from '../presenters/staff.presenter';
import { saoPauloDayBounds } from '../utils/sao-paulo-day';

export interface UploadedSelfie {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
/** Alinhado ao cliente: selfie comprimida para caber no R2 com baixo custo. */
const MAX_SELFIE_BYTES = 150 * 1024;

@Injectable()
export class RegisterPunchUseCase {
  constructor(
    private readonly getBySlug: GetCondominiumBySlugUseCase,
    private readonly employees: CondoEmployeeRepository,
    private readonly punches: TimePunchRepository,
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(input: {
    slug: string;
    employeeId: string;
    type: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number | null;
    userAgent?: string | null;
    selfie: UploadedSelfie;
  }): Promise<TimePunchResponseDto> {
    const condo = await this.getBySlug.getOrFail(input.slug);

    if (!condo.hasLocation() || condo.latitude === null || condo.longitude === null) {
      throw new BusinessRuleError(
        'O condomínio ainda não configurou a localização para o ponto eletrônico.',
      );
    }

    const employee = await this.employees.findById(input.employeeId, condo.id);

    if (!employee || !employee.isActive) {
      throw new ResourceNotFoundError('Funcionário não encontrado ou inativo.');
    }

    if (!employee.canAccessTimeClock) {
      throw new BusinessRuleError(
        'Este funcionário não tem acesso ao ponto eletrônico.',
        'STAFF_MODULE_DENIED',
      );
    }

    if (!ALLOWED_MIME.has(input.selfie.mimetype) || input.selfie.size > MAX_SELFIE_BYTES) {
      throw new InvalidFieldError(
        'selfie',
        'Envie uma selfie JPEG/PNG/WebP de até 150 KB.',
      );
    }

    if (
      !Number.isFinite(input.latitude) ||
      !Number.isFinite(input.longitude) ||
      input.latitude < -90 ||
      input.latitude > 90 ||
      input.longitude < -180 ||
      input.longitude > 180
    ) {
      throw new InvalidFieldError('localização', 'Coordenadas GPS inválidas.');
    }

    const punchType = Object.values(PunchType).includes(input.type as PunchType)
      ? (input.type as PunchType)
      : null;

    if (!punchType) {
      throw new InvalidFieldError('tipo', 'Tipo de marcação inválido.');
    }

    const { dayStart, dayEnd } = saoPauloDayBounds(new Date());
    const last = await this.punches.findLastAcceptedOfDay(employee.id, dayStart, dayEnd);
    const expected = nextPunchType(last?.type ?? null);

    if (punchType !== expected) {
      throw new BusinessRuleError(
        `Próxima marcação esperada: ${expected}. Você tentou registrar ${punchType}.`,
        'PUNCH_SEQUENCE',
      );
    }

    const distance = haversineDistanceMeters(
      input.latitude,
      input.longitude,
      condo.latitude,
      condo.longitude,
    );
    const radius = condo.geofenceRadiusMeters ?? 100;
    const maxAccuracyMeters = 80;
    const accuracy = input.accuracyMeters;
    const accuracyOk =
      accuracy === undefined ||
      accuracy === null ||
      (Number.isFinite(accuracy) && accuracy > 0 && accuracy <= maxAccuracyMeters);
    const within = distance <= radius && accuracyOk;

    let rejectedReason: string | null = null;

    if (!accuracyOk) {
      rejectedReason = `Precisão do GPS insuficiente: ${Math.round(Number(accuracy))} m (máx. ${maxAccuracyMeters} m). Ative a localização de alta precisão.`;
    } else if (distance > radius) {
      rejectedReason = `Fora do raio: ${distance.toFixed(0)} m (limite ${radius} m)`;
    }

    const punch = TimePunch.create({
      condominiumId: condo.id,
      employeeId: employee.id,
      type: punchType,
      status: within ? PunchStatus.Accepted : PunchStatus.Rejected,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracyMeters: input.accuracyMeters ?? null,
      distanceMeters: distance,
      deviceUserAgent: input.userAgent,
      rejectedReason,
    });

    const storageKey = StorageKeys.timePunchSelfie({
      condominiumId: condo.id,
      punchId: punch.id,
      originalName: input.selfie.originalname || 'selfie.jpg',
    });

    // Sempre grava no Cloudflare R2 (aceita ou rejeitada) para auditoria da marcação.
    await this.fileStorage.save(input.selfie.buffer, storageKey, input.selfie.mimetype);

    const withSelfie = TimePunch.restore({
      ...punch.toSnapshot(),
      selfieStorageKey: storageKey,
    });

    await this.punches.save(withSelfie);

    if (!within) {
      throw new BusinessRuleError(
        rejectedReason ??
          `Você está a ${Math.round(distance)} m do condomínio (raio permitido: ${radius} m). Aproxime-se para registrar o ponto.`,
        accuracyOk ? 'GEOFENCE' : 'GPS_ACCURACY',
      );
    }

    return TimePunchPresenter.toResponse(withSelfie, employee.fullName);
  }
}

@Injectable()
export class ListPunchesUseCase {
  constructor(
    private readonly punches: TimePunchRepository,
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    query: ListPunchesQueryDto,
  ): Promise<TimePunchResponseDto[]> {
    await this.getCondominium.getOrFail(condominiumId);

    const from = query.from ? new Date(`${query.from}T00:00:00.000-03:00`) : undefined;
    const to = query.to ? new Date(`${query.to}T23:59:59.999-03:00`) : undefined;

    const list = await this.punches.list({
      condominiumId,
      employeeId: query.employeeId,
      from,
      to,
      status: query.status,
    });

    const names = new Map<string, string>();
    const staff = await this.employees.listByCondominium(condominiumId);

    for (const employee of staff) {
      names.set(employee.id, employee.fullName);
    }

    return list.map((punch) =>
      TimePunchPresenter.toResponse(punch, names.get(punch.toSnapshot().employeeId)),
    );
  }
}

@Injectable()
export class DownloadPunchSelfieUseCase {
  constructor(
    private readonly punches: TimePunchRepository,
    private readonly fileStorage: FileStorage,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    punchId: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    await this.getCondominium.getOrFail(condominiumId);
    const punch = await this.punches.findById(punchId, condominiumId);

    if (!punch || !punch.selfieStorageKey) {
      throw new ResourceNotFoundError('Selfie não encontrada.');
    }

    const buffer = await this.fileStorage.read(punch.selfieStorageKey);

    return { buffer, fileName: `selfie-${punchId}.jpg` };
  }
}

@Injectable()
export class ExportPunchesCsvUseCase {
  constructor(
    private readonly punches: TimePunchRepository,
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    query: ListPunchesQueryDto,
  ): Promise<{ csv: string; fileName: string }> {
    await this.getCondominium.getOrFail(condominiumId);

    const from = query.from ? new Date(`${query.from}T00:00:00.000-03:00`) : undefined;
    const to = query.to ? new Date(`${query.to}T23:59:59.999-03:00`) : undefined;

    const list = await this.punches.list({
      condominiumId,
      employeeId: query.employeeId,
      from,
      to,
      status: query.status,
    });

    const names = new Map<string, string>();
    const staff = await this.employees.listByCondominium(condominiumId);

    for (const employee of staff) {
      names.set(employee.id, employee.fullName);
    }

    const header = [
      'id',
      'employeeId',
      'employeeName',
      'type',
      'status',
      'punchedAt',
      'latitude',
      'longitude',
      'accuracyMeters',
      'distanceMeters',
      'rejectedReason',
    ].join(',');

    const lines = list.map((punch) => {
      const s = punch.toSnapshot();
      const name = names.get(s.employeeId) ?? '';

      return [
        s.id,
        s.employeeId,
        csvEscape(name),
        s.type,
        s.status,
        s.punchedAt.toISOString(),
        s.latitude,
        s.longitude,
        s.accuracyMeters ?? '',
        s.distanceMeters,
        csvEscape(s.rejectedReason ?? ''),
      ].join(',');
    });

    const fromLabel = query.from ?? 'inicio';
    const toLabel = query.to ?? 'fim';

    return {
      csv: [header, ...lines].join('\n'),
      fileName: `punches-${fromLabel}_${toLabel}.csv`,
    };
  }
}

@Injectable()
export class PurgeOldPunchSelfiesUseCase {
  constructor(
    private readonly punches: TimePunchRepository,
    private readonly fileStorage: FileStorage,
    private readonly getCondominium: GetCondominiumUseCase,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(condominiumId: string): Promise<{ purged: number }> {
    await this.getCondominium.getOrFail(condominiumId);

    const retentionDays = this.config.get('PUNCH_SELFIE_RETENTION_DAYS', { infer: true }) ?? 90;
    const olderThan = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const candidates = await this.punches.listSelfiesForPurge(condominiumId, olderThan);
    let purged = 0;

    for (const punch of candidates) {
      const key = punch.selfieStorageKey;

      if (!key) {
        continue;
      }

      try {
        await this.fileStorage.delete(key);
      } catch {
        // Continua: marca purged mesmo se o arquivo já não existir no R2.
      }

      await this.punches.save(punch.withSelfiePurged());
      purged += 1;
    }

    return { purged };
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
