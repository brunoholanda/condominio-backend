import type { FormerResidentRecord } from '../../domain/entities/former-resident';
import type {
  FormerResidentDetailDto,
  FormerResidentListItemDto,
} from '../dto/former-resident-response.dto';

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) {
    return '***.***.***-**';
  }

  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export class FormerResidentPresenter {
  static toListItem(record: FormerResidentRecord): FormerResidentListItemDto {
    const { payload } = record;

    return {
      id: record.id,
      condominiumId: record.condominiumId,
      unit: record.unit,
      sourceResidentId: record.sourceResidentId,
      reason: record.reason,
      fullName: payload.fullName,
      cpfMasked: maskCpf(payload.cpf),
      supersededAt: record.supersededAt.toISOString(),
      retainUntil: record.retainUntil.toISOString(),
      supersededByUserId: record.supersededByUserId,
    };
  }

  static toDetail(record: FormerResidentRecord): FormerResidentDetailDto {
    return {
      ...this.toListItem(record),
      payload: record.payload as unknown as Record<string, unknown>,
    };
  }
}
